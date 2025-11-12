import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { organizationApi } from '@/api/organization-api';

/**
 * CreateOrganizationPaymentForm - Stripe Payment Element integration
 * 
 * This component handles payment collection for both trial and paid subscriptions.
 * Following Stripe best practices, we collect payment details upfront for both:
 * - Trial: $0 invoice with SetupIntent (saves payment method for future billing)
 * - Paid: Regular invoice with PaymentIntent (charges immediately)
 * 
 * Flow:
 * 1. Parent creates Stripe subscription and gets clientSecret
 * 2. This component shows Payment Element with clientSecret
 * 3. User enters payment details
 * 4. stripe.confirmPayment() confirms payment/setup
 * 5. Stripe webhook confirms → creates local subscription record
 * 6. Parent creates organization with confirmed subscription
 * 
 * @param stripeSubscriptionId - Stripe subscription ID to attach to organization
 * @param organizationName - Name for the organization to be created
 * @param isTrial - Whether this is a trial subscription (for messaging)
 * @param onBack - Callback to return to previous step
 * @param onSuccess - Callback when organization is created successfully
 */
interface CreateOrganizationPaymentFormProps
{
  stripeSubscriptionId: string;
  organizationName: string;
  isTrial: boolean;
  onBack: () => void;
  onSuccess: (orgId: string) => void;
}

export const CreateOrganizationPaymentForm: React.FC<CreateOrganizationPaymentFormProps> = ({
  stripeSubscriptionId,
  organizationName,
  isTrial,
  onBack,
  onSuccess,
}) =>
{
  const { t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Mutation to create organization after payment confirmation
   */
  const createOrganizationMutation = useMutation({
    mutationFn: (subscriptionId: string) =>
      organizationApi.createOrganization({
        name: organizationName,
        subscriptionId,
      }),
    onSuccess: (organization) =>
    {
      onSuccess(organization.id);
    },
  });

  /**
   * Handle payment form submission
   * 
   * For trials: Confirms SetupIntent (saves payment method, no charge)
   * For paid: Confirms PaymentIntent (charges immediately)
   * 
   * After Stripe confirmation, webhook will create local subscription record,
   * then we can create the organization.
   */
  const handleSubmit = async (e: React.FormEvent) =>
  {
    e.preventDefault();

    if (!stripe || !elements)
    {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try
    {
      // Confirm payment with Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/organizations/create/complete`,
        },
        redirect: 'if_required', // Only redirect if required (e.g., 3D Secure)
      });

      if (error)
      {
        // Payment failed - show error to user
        setErrorMessage(error.message || t('organizations.create.error'));
        setIsProcessing(false);
      }
      else
      {
        // Payment succeeded! 
        // Note: At this point, Stripe has sent webhook to backend.
        // The backend will create the local subscription record.
        // We need to wait a moment for the webhook to process, then create org.
        
        // Small delay to allow webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create organization with the Stripe subscription ID
        // The backend will verify the subscription exists and is active/trialing
        await createOrganizationMutation.mutateAsync(stripeSubscriptionId);
      }
    }
    catch (err)
    {
      const errorMsg = err instanceof Error ? err.message : t('organizations.create.error');
      setErrorMessage(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('organizations.create.paymentDescription', { name: organizationName })}</CardTitle>
        <CardDescription>
          {isTrial
            ? t('organizations.create.trialEligible')
            : t('organizations.create.subscriptionNote')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) =>
          {
            void handleSubmit(e);
          }}
        >
          <Stack space="lg">
            {/* Stripe Payment Element */}
            <PaymentElement />

            {/* Error Message */}
            {errorMessage && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {errorMessage}
              </div>
            )}

            {/* Form Actions */}
            <Stack direction="horizontal" space="md" className="justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
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
                {isProcessing || createOrganizationMutation.isPending
                  ? t('common.loading')
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
