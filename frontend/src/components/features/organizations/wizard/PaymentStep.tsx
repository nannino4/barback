import React, { useState } from 'react';
import { useStripe, useElements, ExpressCheckoutElement, PaymentElement } from '@stripe/react-stripe-js';
import type { StripeError, StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stack } from '@/components/layout';
import { InlineSpinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/useI18n';
import { organizationApi } from '@/api/organization-api';
import { paymentElementOptions, expressCheckoutOptions } from '@/lib/stripe/config';
import { getLocalizedErrorMessage, ApiError } from '@/lib/errors';

/**
 * PaymentStep - Third step of organization creation wizard
 * 
 * This component handles payment collection for both trial and paid subscriptions.
 * Following Stripe best practices, we collect payment details upfront for both:
 * - Trial: $0 invoice with SetupIntent (saves payment method for future billing)
 * - Paid: Regular invoice with PaymentIntent (charges immediately)
 * 
 * Uses Express Checkout Element with fallback to standard Payment Element
 * for maximum payment method coverage (Apple Pay, Google Pay, cards)
 * 
 * Flow:
 * 1. Parent creates Stripe subscription and gets clientSecret
 * 2. This component shows Express Checkout Element (or Payment Element fallback)
 * 3. User selects payment method and completes payment
 * 4. Stripe webhook (`customer.subscription.created`) creates local subscription with INCOMPLETE status
 * 5. Create organization immediately (with retry logic to handle webhook race condition)
 *    - Organization creation accepts INCOMPLETE, ACTIVE, or TRIALING subscription status
 * 6. Redirect to organization page where user can see subscription status
 * 7. Webhook (`customer.subscription.updated`) later updates status to ACTIVE/TRIALING
 * 
 * @param stripeSubscriptionId - Stripe subscription ID to attach to organization
 * @param organizationName - Name for the organization to be created
 * @param isTrial - Whether this is a trial subscription (for messaging)
 * @param onBack - Callback to return to previous step
 * @param onSuccess - Callback when organization is created successfully
 */
interface PaymentStepProps
{
  stripeSubscriptionId: string;
  organizationName: string;
  isTrial: boolean;
  intentType: 'setup' | 'payment';
  onBack: () => void;
  onSuccess: (orgId: string) => void;
}

const CREATE_ORG_MAX_ATTEMPTS = 5;
const CREATE_ORG_RETRY_DELAY_MS = 2000;

const wait = (ms: number): Promise<void> =>
{
  return new Promise((resolve) =>
  {
    window.setTimeout(resolve, ms);
  });
};

export const PaymentStep: React.FC<PaymentStepProps> = ({
  stripeSubscriptionId,
  organizationName,
  isTrial,
  intentType,
  onBack,
  onSuccess,
}) =>
{
  const { t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);


  const getStripePaymentErrorMessage = (error?: StripeError): string =>
  {
    if (!error)
    {
      return t('organizations.create.paymentStep.errors.unexpected');
    }

    if (error.type === 'card_error')
    {
      return error.message ?? t('organizations.create.paymentStep.errors.card');
    }

    if (error.type === 'validation_error')
    {
      return error.message ?? t('organizations.create.paymentStep.errors.validation');
    }

    return error.message ?? t('organizations.create.paymentStep.errors.unexpected');
  };

  /**
   * Mutation to create organization after payment confirmation
   */
  const createOrganizationMutation = useMutation({
    mutationFn: (subscriptionId: string) =>
      organizationApi.createOrganization({
        name: organizationName,
        stripeSubscriptionId: subscriptionId,
      }),
    onSuccess: (organization) =>
    {
      setStatusMessage(null);
      setIsProcessing(false);
      void queryClient.invalidateQueries({ queryKey: ['organizations'] });
      onSuccess(organization.id);
    },
  });

  const shouldRetryOrganizationCreation = (error: unknown): boolean =>
  {
    if (!ApiError.isApiError(error))
    {
      return false;
    }

    return error.error === 'SUBSCRIPTION_NOT_FOUND' || error.error === 'SUBSCRIPTION_NOT_ACTIVE';
  };

  const handleFinalizationError = (error: unknown): void =>
  {
    const localizedMessage = ApiError.isApiError(error)
      ? getLocalizedErrorMessage(error, t)
      : error instanceof Error
        ? error.message
        : t('organizations.create.paymentStep.paymentFailed');

    setErrorMessage(localizedMessage);
    setStatusMessage(null);
    setIsProcessing(false);
  };

  const attemptOrganizationCreation = async (): Promise<void> =>
  {
    for (let attempt = 1; attempt <= CREATE_ORG_MAX_ATTEMPTS; attempt += 1)
    {
      setStatusMessage(
        attempt === 1
          ? (t('organizations.create.paymentStep.status.creatingOrganization' as never) as string)
          : (t('organizations.create.paymentStep.status.retryingOrganization' as never, {
            attempt,
            max: CREATE_ORG_MAX_ATTEMPTS,
          }) as string),
      );

      try
      {
        await createOrganizationMutation.mutateAsync(stripeSubscriptionId);
        return;
      }
      catch (error)
      {
        if (!shouldRetryOrganizationCreation(error) || attempt === CREATE_ORG_MAX_ATTEMPTS)
        {
          throw error;
        }
        await wait(CREATE_ORG_RETRY_DELAY_MS);
      }
    }
  };

  const finalizeOrganizationCreation = async (): Promise<void> =>
  {
    await attemptOrganizationCreation();
  };

  /**
   * Handle Express Checkout confirmation
   */
  const handleExpressCheckout = async (event: StripeExpressCheckoutElementConfirmEvent) =>
  {
    if (!stripe || !elements)
    {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(t('organizations.create.paymentStep.status.confirmingWallet' as never) as string);
    
    try
    {
      const { error } = intentType === 'setup'
        ? await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/orgs',
          },
          redirect: 'if_required',
        })
        : await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/orgs',
          },
          redirect: 'if_required',
        });

      if (error)
      {
        const friendlyMessage = getStripePaymentErrorMessage(error);

        if (event.paymentFailed)
        {
          event.paymentFailed({
            reason: 'fail',
            message: friendlyMessage,
          });
        }

        setErrorMessage(friendlyMessage);
        setIsProcessing(false);
        setStatusMessage(null);
        return;
      }

      await finalizeOrganizationCreation();
    }
    catch (error)
    {
      handleFinalizationError(error);
    }
  };

  /**
   * Handle standard Payment Element submission
   */
  const handleStandardPayment = async (e: React.FormEvent) =>
  {
    e.preventDefault();
    
    if (!stripe || !elements)
    {
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(t('organizations.create.paymentStep.status.confirmingCard' as never) as string);
    
    try
    {
      const { error } = intentType === 'setup'
        ? await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/orgs',
          },
          redirect: 'if_required',
        })
        : await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/orgs',
          },
          redirect: 'if_required',
        });
      
      if (error)
      {
        setErrorMessage(getStripePaymentErrorMessage(error));
        setIsProcessing(false);
        setStatusMessage(null);
        return;
      }

      await finalizeOrganizationCreation();
    }
    catch (error)
    {
      handleFinalizationError(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('organizations.create.paymentStep.title')}
        </CardTitle>
        <CardDescription>
          {t('organizations.create.paymentStep.description', { name: organizationName })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleStandardPayment(e)}>
          <Stack space="lg">
            {/* Trial/Subscription Note */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                {isTrial
                  ? t('organizations.create.paymentStep.trialNote')
                  : t('organizations.create.paymentStep.subscriptionNote')}
              </p>
            </div>

            {/* Express Checkout Element */}
            <div>
              <ExpressCheckoutElement
                onConfirm={(event) => void handleExpressCheckout(event)}
                onReady={() => setExpressCheckoutReady(true)}
                options={expressCheckoutOptions}
              />
              
              {/* Divider - only show if express checkout is ready */}
              {expressCheckoutReady && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('common.or')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Standard Payment Element (fallback) */}
            <PaymentElement options={paymentElementOptions} />

            {/* Status Message */}
            {statusMessage && (
              <div className="p-3 rounded-lg bg-primary/5 border border-border flex items-center gap-2 text-sm text-muted-foreground">
                <InlineSpinner className="text-primary" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}

            {/* Form Actions */}
            <Stack direction="horizontal" space="md" className="justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                {
                  setStatusMessage(null);
                  setErrorMessage(null);
                  onBack();
                }}
                disabled={isProcessing || createOrganizationMutation.isPending}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>

              <Button
                type="submit"
                disabled={!stripe || isProcessing || createOrganizationMutation.isPending}
                className="min-w-[200px]"
              >
                {(isProcessing || createOrganizationMutation.isPending) && (
                  <InlineSpinner className="mr-2" />
                )}
                {isProcessing
                  ? t('organizations.create.paymentStep.processingPayment')
                  : createOrganizationMutation.isPending
                    ? t('organizations.create.paymentStep.creatingOrganization')
                    : isTrial
                      ? t('subscription.startTrial')
                      : t('organizations.create.create')}
              </Button>
            </Stack>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};
