import React, { use, useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CreditCard, Plus, Trash2 } from 'lucide-react';

import { paymentApi } from '@/api/payment-api';
import { Stack } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineSpinner } from '@/components/ui/spinner';
import { ResolvedThemeContext } from '@/contexts/ThemeContext';
import { useI18n } from '@/hooks/useI18n';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { queryKeys } from '@/lib/queryKeys';
import { buildStripeAppearance, getStripeLocale, paymentElementOptions, stripeFonts } from '@/lib/stripe/config';
import type { PaymentMethodResponse } from '@/types/payment';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

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

interface AddPersonalPaymentMethodFormProps
{
  setAsDefault: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const AddPersonalPaymentMethodForm: React.FC<AddPersonalPaymentMethodFormProps> = ({
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
        setErrorMessage(error.message ?? t('payment.add.stripeError'));
        setIsProcessing(false);
        return;
      }

      const paymentMethod = setupIntent?.payment_method;
      const paymentMethodId = typeof paymentMethod === 'string' ? paymentMethod : paymentMethod?.id;

      if (!paymentMethodId)
      {
        setErrorMessage(t('payment.add.error'));
        setIsProcessing(false);
        return;
      }

      await paymentApi.addPaymentMethod({ paymentMethodId, setAsDefault });
      await queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      await queryClient.invalidateQueries({ queryKey: ['organization'] });
      notify.success(t('payment.add.success'));
      setIsProcessing(false);
      onSuccess();
    }
    catch (error)
    {
      const message = ApiError.isApiError(error)
        ? getLocalizedErrorMessage(error, t)
        : error instanceof Error
          ? error.message
          : t('payment.add.error');
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
            {t('payment.add.addButton')}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

interface AddPersonalPaymentMethodDialogProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPersonalPaymentMethodDialog: React.FC<AddPersonalPaymentMethodDialogProps> = ({ open, onOpenChange }) =>
{
  const { t, currentLanguage } = useI18n();
  const resolvedTheme = use(ResolvedThemeContext);
  const stripeAppearance = useMemo(() => buildStripeAppearance(resolvedTheme), [resolvedTheme]);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const setupIntentMutation = useMutation({
    mutationFn: paymentApi.createSetupIntent,
  });
  const { mutate: createSetupIntent, reset: resetSetupIntent } = setupIntentMutation;
  const clientSecret = setupIntentMutation.data?.clientSecret;

  useEffect(() =>
  {
    if (open)
    {
      createSetupIntent();
    }
    else
    {
      resetSetupIntent();
      setSetAsDefault(false);
    }
  }, [open, createSetupIntent, resetSetupIntent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('payment.add.title')}</DialogTitle>
          <DialogDescription>{t('payment.add.description')}</DialogDescription>
        </DialogHeader>

        {setupIntentMutation.isError ? (
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
                checked={setAsDefault}
                onChange={(event) => setSetAsDefault(event.target.checked)}
              />
              {t('payment.add.setAsDefault')}
            </label>

            <Elements
              key={`personal-pm-${resolvedTheme}-${clientSecret}`}
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: stripeAppearance,
                locale: getStripeLocale(currentLanguage),
                fonts: stripeFonts,
              }}
            >
              <AddPersonalPaymentMethodForm
                setAsDefault={setAsDefault}
                onSuccess={() => onOpenChange(false)}
                onClose={() => onOpenChange(false)}
              />
            </Elements>
          </Stack>
        ) : (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-32 ml-auto" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface RemovePaymentMethodDialogProps
{
  paymentMethod: PaymentMethodResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RemovePaymentMethodDialog: React.FC<RemovePaymentMethodDialogProps> = ({ paymentMethod, open, onOpenChange }) =>
{
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: (paymentMethodId: string) => paymentApi.removePaymentMethod(paymentMethodId),
    onSuccess: async () =>
    {
      await queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      await queryClient.invalidateQueries({ queryKey: ['organization'] });
      notify.success(t('payment.remove.success'));
      onOpenChange(false);
    },
    onError: (error) =>
    {
      const message = ApiError.isApiError(error)
        ? getLocalizedErrorMessage(error, t)
        : t('payment.remove.error');
      notify.error(message);
    },
  });

  if (!paymentMethod)
  {
    return null;
  }

  const usages = paymentMethod.usedBySubscriptions ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('payment.remove.title')}</DialogTitle>
          <DialogDescription>{t('payment.remove.description')}</DialogDescription>
        </DialogHeader>

        <Stack space="md">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{formatPaymentMethod(paymentMethod, t)}</p>
            {paymentMethod.card && (
              <p className="text-muted-foreground mt-1">
                {t('payment.expiresOn', { month: paymentMethod.card.expMonth, year: paymentMethod.card.expYear })}
              </p>
            )}
          </div>

          {usages.length > 0 && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm">
              <p className="font-medium text-destructive">{t('payment.remove.usedByTitle')}</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {usages.map((usage) => (
                  <li key={`${usage.organizationId}-${usage.subscriptionId}`}>
                    {usage.organizationName}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-muted-foreground">{t('payment.remove.usedByWarning')}</p>
            </div>
          )}

          {paymentMethod.isDefault && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              {t('payment.remove.defaultWarning')}
            </div>
          )}
        </Stack>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={removeMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => removeMutation.mutate(paymentMethod.id)}
            disabled={removeMutation.isPending}
          >
            {removeMutation.isPending && <InlineSpinner className="mr-2" />}
            {removeMutation.isPending ? t('payment.remove.removing') : t('payment.remove.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const PersonalPaymentMethodsCard: React.FC = () =>
{
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [paymentMethodToRemove, setPaymentMethodToRemove] = useState<PaymentMethodResponse | null>(null);

  const paymentMethodsQuery = useQuery({
    queryKey: queryKeys.paymentMethods.all,
    queryFn: paymentApi.getPaymentMethods,
  });

  const setDefaultMutation = useMutation({
    mutationFn: paymentApi.setDefaultPaymentMethod,
    onSuccess: async () =>
    {
      await queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
      await queryClient.invalidateQueries({ queryKey: ['organization'] });
      notify.success(t('payment.setDefault.success'));
    },
    onError: (error) =>
    {
      const message = ApiError.isApiError(error)
        ? getLocalizedErrorMessage(error, t)
        : t('payment.setDefault.error');
      notify.error(message);
    },
  });

  const paymentMethods = paymentMethodsQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <Stack direction="horizontal" align="center" justify="between" className="gap-3 flex-wrap">
          <Stack direction="horizontal" space="sm" align="center">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{t('payment.methods')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t('payment.personalDescription')}</p>
            </div>
          </Stack>
          <Button type="button" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('payment.addMethod')}
          </Button>
        </Stack>
      </CardHeader>
      <CardContent>
        {paymentMethodsQuery.isLoading ? (
          <Stack space="sm">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </Stack>
        ) : paymentMethods.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-medium">{t('payment.noMethods')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('payment.noMethodsDescription')}</p>
          </div>
        ) : (
          <Stack space="md">
            {paymentMethods.map((method) => (
              <div key={method.id} className="rounded-lg border border-border p-4">
                <Stack direction="horizontal" align="start" justify="between" className="gap-3 flex-wrap">
                  <div className="min-w-0">
                    <Stack direction="horizontal" space="sm" align="center" className="flex-wrap">
                      <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
                      <p className="font-medium">{formatPaymentMethod(method, t)}</p>
                      {method.isDefault && <Badge variant="secondary">{t('payment.defaultLabel')}</Badge>}
                    </Stack>
                    {method.card && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('payment.expiresOn', { month: method.card.expMonth, year: method.card.expYear })}
                        {method.card.expYear < new Date().getFullYear() && ` · ${t('payment.expired')}`}
                      </p>
                    )}
                    {(method.usedBySubscriptions ?? []).length > 0 ? (
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('payment.usedBy', {
                          count: method.usedBySubscriptions?.length ?? 0,
                          organizations: method.usedBySubscriptions?.map(usage => usage.organizationName).join(', ') ?? '',
                        })}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">{t('payment.notUsedBySubscriptions')}</p>
                    )}
                  </div>

                  <Stack direction="horizontal" space="sm" className="flex-wrap justify-end">
                    {!method.isDefault && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultMutation.mutate(method.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        {setDefaultMutation.isPending && setDefaultMutation.variables === method.id && <InlineSpinner className="mr-2" />}
                        {t('payment.setDefaultButton')}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentMethodToRemove(method)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('payment.removeButton')}
                    </Button>
                  </Stack>
                </Stack>
              </div>
            ))}
          </Stack>
        )}
      </CardContent>

      <AddPersonalPaymentMethodDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <RemovePaymentMethodDialog
        open={Boolean(paymentMethodToRemove)}
        onOpenChange={(open) =>
        {
          if (!open)
          {
            setPaymentMethodToRemove(null);
          }
        }}
        paymentMethod={paymentMethodToRemove}
      />
    </Card>
  );
};
