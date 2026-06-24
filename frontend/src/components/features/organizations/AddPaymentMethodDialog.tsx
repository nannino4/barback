import React, { useEffect, useMemo, useState, use } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CreditCard, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { InlineSpinner, Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/useI18n';
import { paymentApi } from '@/api/payment-api';
import { subscriptionApi } from '@/api/subscription-api';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';
import { formatCurrency } from '@/lib/formatters/formatCurrency';
import { buildStripeAppearance, getStripeLocale, paymentElementOptions, stripeFonts } from '@/lib/stripe/config';
import { ResolvedThemeContext } from '@/contexts/ThemeContext';
import type { PaymentMethodResponse } from '@/types/payment';
import type { SubscriptionStatus } from '@/types/subscription';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

interface AddPaymentMethodDialogProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Local subscription id the payment method should be assigned to. */
  subscriptionId: string;
  /** Payment method currently used by this subscription. */
  currentPaymentMethodId?: string;
  /** Current subscription status; paused subscriptions show the resume charge preview. */
  subscriptionStatus?: SubscriptionStatus;
  /** Called after the payment method is successfully assigned. */
  onSuccess?: () => void;
}

interface AddPaymentMethodFormProps
{
  subscriptionId: string;
  setAsDefault: boolean;
  onSuccess?: () => void;
  onClose: () => void;
}

const formatPaymentMethod = (method: PaymentMethodResponse, t: ReturnType<typeof useI18n>['t']): string =>
{
  if (!method.card)
  {
    return method.type;
  }

  const brandKey = `payment.cardBrand.${method.card.brand}`;
  const brand = t(brandKey as never) as string;
  return `${brand} •••• ${method.card.last4}`;
};

/**
 * Inner form rendered inside <Elements>. Collects a card via the Payment Element,
 * confirms the SetupIntent, then assigns the resulting payment method to the
 * subscription (which also resumes a paused trial).
 */
const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({
  subscriptionId,
  setAsDefault,
  onSuccess,
  onClose,
}) =>
{
  const { t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent): Promise<void> =>
  {
    event.preventDefault();

    if (!stripe || !elements)
    {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try
    {
      await elements.submit();

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (error)
      {
        setErrorMessage(error.message ?? t('subscription.addPayment.errors.unexpected'));
        setIsProcessing(false);
        return;
      }

      const paymentMethod = setupIntent?.payment_method;
      const paymentMethodId = typeof paymentMethod === 'string' ? paymentMethod : paymentMethod?.id;

      if (!paymentMethodId)
      {
        setErrorMessage(t('subscription.addPayment.errors.unexpected'));
        setIsProcessing(false);
        return;
      }

      await subscriptionApi.attachPaymentMethod(subscriptionId, paymentMethodId, setAsDefault);

      // Refresh org subscription/status and payment method views everywhere.
      await queryClient.invalidateQueries({ queryKey: ['organization'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });

      setIsProcessing(false);
      onSuccess?.();
      onClose();
    }
    catch (error)
    {
      const message = ApiError.isApiError(error)
        ? getLocalizedErrorMessage(error, t)
        : error instanceof Error
          ? error.message
          : t('subscription.addPayment.errors.unexpected');
      setErrorMessage(message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <Stack space="lg">
        <PaymentElement options={paymentElementOptions} />

        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        <Stack direction="horizontal" space="md" className="justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={!stripe || isProcessing}>
            {isProcessing && <InlineSpinner className="mr-2" />}
            {t('subscription.addPayment.submit')}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

/**
 * AddPaymentMethodDialog - manages the payment method assigned to a subscription.
 *
 * The user can choose an existing customer payment method, add a new card, and
 * set the customer-level default. Assigning a method to a paused subscription also
 * resumes it, after showing the amount Stripe previews as due now.
 */
export const AddPaymentMethodDialog: React.FC<AddPaymentMethodDialogProps> = ({
  open,
  onOpenChange,
  subscriptionId,
  currentPaymentMethodId,
  subscriptionStatus,
  onSuccess,
}) =>
{
  const { t, currentLanguage } = useI18n();
  const queryClient = useQueryClient();
  const resolvedTheme = use(ResolvedThemeContext);
  const stripeAppearance = useMemo(() => buildStripeAppearance(resolvedTheme), [resolvedTheme]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [setNewAsDefault, setSetNewAsDefault] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paymentMethodsQuery = useQuery({
    queryKey: queryKeys.paymentMethods.all,
    queryFn: paymentApi.getPaymentMethods,
    enabled: open,
  });

  const resumePreviewQuery = useQuery({
    queryKey: queryKeys.subscriptions.resumePreview(subscriptionId),
    queryFn: () => subscriptionApi.getResumePreview(subscriptionId),
    enabled: open && subscriptionStatus === 'PAUSED',
  });

  const setupIntentMutation = useMutation({
    mutationFn: paymentApi.createSetupIntent,
  });
  const { mutate: createSetupIntent, reset: resetSetupIntent } = setupIntentMutation;
  const clientSecret = setupIntentMutation.data?.clientSecret;

  const assignMutation = useMutation({
    mutationFn: (paymentMethodId: string) => subscriptionApi.attachPaymentMethod(subscriptionId, paymentMethodId),
    onSuccess: async () =>
    {
      await queryClient.invalidateQueries({ queryKey: ['organization'] });
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) =>
    {
      const message = ApiError.isApiError(error)
        ? getLocalizedErrorMessage(error, t)
        : t('subscription.addPayment.errors.unexpected');
      setErrorMessage(message);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: paymentApi.setDefaultPaymentMethod,
    onSuccess: async () =>
    {
      await queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
      await queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });

  const paymentMethods = paymentMethodsQuery.data ?? [];
  const shouldShowAddForm = showAddForm || (!paymentMethodsQuery.isLoading && paymentMethods.length === 0);

  // Create a fresh SetupIntent when the add-card form is visible; clear it on close.
  useEffect(() =>
  {
    if (open && shouldShowAddForm)
    {
      createSetupIntent();
    }
    else
    {
      resetSetupIntent();
    }
  }, [open, shouldShowAddForm, createSetupIntent, resetSetupIntent]);

  useEffect(() =>
  {
    if (!open)
    {
      setShowAddForm(false);
      setSetNewAsDefault(false);
      setErrorMessage(null);
    }
  }, [open]);

  const resumePreview = resumePreviewQuery.data;
  const amountDue = resumePreview
    ? formatCurrency(resumePreview.amountDue / 100, currentLanguage, resumePreview.currency.toUpperCase())
    : null;
  const recurringAmount = resumePreview
    ? formatCurrency(resumePreview.recurringAmount / 100, currentLanguage, resumePreview.recurringCurrency.toUpperCase())
    : null;
  const recurringPeriod = resumePreview?.billingInterval === 'MONTHLY'
    ? t('orgManagement.subscription.monthly')
    : t('orgManagement.subscription.yearly');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('subscription.addPayment.title')}</DialogTitle>
          <DialogDescription>{t('subscription.addPayment.description')}</DialogDescription>
        </DialogHeader>

        <Stack space="lg">
          {subscriptionStatus === 'PAUSED' && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm">
              {resumePreviewQuery.isLoading ? (
                <Spinner size="sm" text={t('common.loading')} />
              ) : resumePreview && amountDue && recurringAmount ? (
                <Stack space="xs">
                  <p>
                    <span className="text-muted-foreground">{t('subscription.addPayment.dueNow')}:</span>{' '}
                    <span className="font-semibold">{amountDue}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">{t('subscription.addPayment.recurring')}:</span>{' '}
                    <span className="font-semibold">{recurringAmount}</span>{' '}
                    <span className="text-muted-foreground">/ {recurringPeriod}</span>
                  </p>
                </Stack>
              ) : (
                <p className="text-muted-foreground">{t('subscription.addPayment.previewUnavailable')}</p>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {paymentMethodsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text={t('common.loading')} />
            </div>
          ) : paymentMethods.length > 0 && !shouldShowAddForm ? (
            <Stack space="md">
              {paymentMethods.map((method: PaymentMethodResponse) => 
              {
                const isCurrent = method.id === currentPaymentMethodId;
                const isAssigning = assignMutation.isPending && assignMutation.variables === method.id;

                return (
                  <div key={method.id} className="p-3 rounded-lg border border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium">{formatPaymentMethod(method, t)}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {isCurrent && <Badge>{t('subscription.addPayment.current')}</Badge>}
                          {method.isDefault && <Badge variant="secondary">{t('payment.defaultLabel')}</Badge>}
                        </div>
                      </div>
                    </div>

                    <Stack direction="horizontal" space="sm" className="flex-wrap justify-end">
                      {!method.isDefault && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultMutation.mutate(method.id)}
                          disabled={setDefaultMutation.isPending || assignMutation.isPending}
                        >
                          {t('payment.setDefaultButton')}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => assignMutation.mutate(method.id)}
                        disabled={isCurrent || assignMutation.isPending || setDefaultMutation.isPending}
                      >
                        {isAssigning && <InlineSpinner className="mr-2" />}
                        {subscriptionStatus === 'PAUSED'
                          ? t('subscription.trialBanner.reactivate')
                          : t('subscription.addPayment.useForSubscription')}
                      </Button>
                    </Stack>
                  </div>
                );
              })}

              <Button type="button" variant="outline" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('payment.addMethod')}
              </Button>
            </Stack>
          ) : setupIntentMutation.isError ? (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{t('subscription.addPayment.errors.setupFailed')}</p>
            </div>
          ) : clientSecret ? (
            <Stack space="md">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={setNewAsDefault}
                  onChange={(event) => setSetNewAsDefault(event.target.checked)}
                />
                {t('payment.add.setAsDefault')}
              </label>

              <Elements
                key={`add-pm-${resolvedTheme}-${clientSecret}`}
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: stripeAppearance,
                  locale: getStripeLocale(currentLanguage),
                  fonts: stripeFonts,
                }}
              >
                <AddPaymentMethodForm
                  subscriptionId={subscriptionId}
                  setAsDefault={setNewAsDefault}
                  onSuccess={onSuccess}
                  onClose={() => onOpenChange(false)}
                />
              </Elements>

              {paymentMethods.length > 0 && (
                <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                  {t('subscription.addPayment.chooseExisting')}
                </Button>
              )}
            </Stack>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text={t('common.loading')} />
            </div>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
