import React, { useEffect, useMemo, useState, use } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { InlineSpinner, Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/useI18n';
import { paymentApi } from '@/api/payment-api';
import { subscriptionApi } from '@/api/subscription-api';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
import { buildStripeAppearance, getStripeLocale, paymentElementOptions, stripeFonts } from '@/lib/stripe/config';
import { ResolvedThemeContext } from '@/contexts/ThemeContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

interface AddPaymentMethodDialogProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Local subscription id the payment method should be attached to. */
  subscriptionId: string;
  /** Called after the payment method is successfully attached. */
  onSuccess?: () => void;
}

/**
 * Inner form rendered inside <Elements>. Collects a card via the Payment Element,
 * confirms the SetupIntent, then attaches the resulting payment method to the
 * subscription (which also resumes a paused trial).
 */
const AddPaymentMethodForm: React.FC<{
  subscriptionId: string;
  onSuccess?: () => void;
  onClose: () => void;
}> = ({ subscriptionId, onSuccess, onClose }) =>
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

      await subscriptionApi.attachPaymentMethod(subscriptionId, paymentMethodId);

      // Refresh org subscription + status everywhere.
      await queryClient.invalidateQueries({ queryKey: ['organization'] });
      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] });

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
    <form onSubmit={(e) => void handleSubmit(e)}>
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
 * AddPaymentMethodDialog - collects and saves a payment method for a subscription.
 *
 * Used after a frictionless trial to add a card (and resume a paused trial). Creates
 * a SetupIntent on open, then renders the Stripe Payment Element.
 */
export const AddPaymentMethodDialog: React.FC<AddPaymentMethodDialogProps> = ({
  open,
  onOpenChange,
  subscriptionId,
  onSuccess,
}) =>
{
  const { t, currentLanguage } = useI18n();
  const resolvedTheme = use(ResolvedThemeContext);
  const stripeAppearance = useMemo(() => buildStripeAppearance(resolvedTheme), [resolvedTheme]);

  const setupIntentMutation = useMutation({
    mutationFn: paymentApi.createSetupIntent,
  });
  const { mutate: createSetupIntent, reset: resetSetupIntent } = setupIntentMutation;
  const clientSecret = setupIntentMutation.data?.clientSecret;

  // Create a fresh SetupIntent each time the dialog opens; clear it on close.
  useEffect(() =>
  {
    if (open)
    {
      createSetupIntent();
    }
    else
    {
      resetSetupIntent();
    }
  }, [open, createSetupIntent, resetSetupIntent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('subscription.addPayment.title')}</DialogTitle>
          <DialogDescription>{t('subscription.addPayment.description')}</DialogDescription>
        </DialogHeader>

        {setupIntentMutation.isError ? (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{t('subscription.addPayment.errors.setupFailed')}</p>
          </div>
        ) : clientSecret ? (
          <Elements
            key={`add-pm-${resolvedTheme}`}
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
              onSuccess={onSuccess}
              onClose={() => onOpenChange(false)}
            />
          </Elements>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" text={t('common.loading')} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
