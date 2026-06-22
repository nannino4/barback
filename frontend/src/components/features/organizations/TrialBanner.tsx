import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizationStore } from '@/stores/organizationStore';
import { organizationApi } from '@/api/organization-api';
import { paymentApi } from '@/api/payment-api';
import { queryKeys } from '@/lib/queryKeys';
import { daysUntil } from '@/lib/date';
import { AddPaymentMethodDialog } from './AddPaymentMethodDialog';

/**
 * TrialBanner - global, app-wide trial status for the current organization.
 *
 * Renders only for the OWNER of the current organization when its subscription is
 * TRIALING (countdown + add-payment CTA) or PAUSED (reactivate CTA). Hidden in all
 * other cases (non-owner, no current org, active/other statuses).
 */
export const TrialBanner: React.FC = () =>
{
  const { t } = useI18n();
  const currentOrg = useOrganizationStore((state) => state.currentOrg);
  const [dialogOpen, setDialogOpen] = useState(false);

  const orgId = currentOrg?.org.id;
  const isOwner = currentOrg?.role === 'OWNER';

  // Owner-only endpoint; only fetch when we have an owned current org.
  const { data: subscription } = useQuery({
    queryKey: queryKeys.organizations.subscription(orgId ?? ''),
    queryFn: () => organizationApi.getOrganizationSubscription(orgId ?? ''),
    enabled: !!orgId && isOwner,
  });

  const isTrialing = subscription?.status === 'TRIALING';
  const isPaused = subscription?.status === 'PAUSED';
  const shouldLoadPaymentMethods = !!orgId && isOwner && (isTrialing || isPaused);
  const {
    data: paymentMethods,
    isLoading: isLoadingPaymentMethods,
  } = useQuery({
    queryKey: queryKeys.paymentMethods.all,
    queryFn: paymentApi.getPaymentMethods,
    enabled: shouldLoadPaymentMethods,
  });

  if (!orgId || !isOwner || !subscription)
  {
    return null;
  }

  if (!isTrialing && !isPaused)
  {
    return null;
  }

  // Once a trial has a payment method on file, no banner/CTA is needed until the
  // trial actually ends. Keep paused subscriptions visible so the user can resume.
  if (isTrialing && (isLoadingPaymentMethods || (paymentMethods?.length ?? 0) > 0))
  {
    return null;
  }

  const daysRemaining = daysUntil(subscription.nextBillingDate);

  return (
    <>
      <div
        className={`px-4 py-3 border-b ${
          isPaused
            ? 'bg-destructive/10 border-destructive/20'
            : 'bg-primary/5 border-border'
        }`}
        role="status"
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            {isPaused ? (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            ) : (
              <Clock className="h-4 w-4 text-primary shrink-0" />
            )}
            <span className={isPaused ? 'text-destructive' : 'text-foreground'}>
              {isPaused
                ? t('subscription.trialBanner.paused')
                : t('subscription.trialBanner.daysLeft' as never, { days: daysRemaining }) as string}
            </span>
          </div>

          <Button
            size="sm"
            variant={isPaused ? 'default' : 'outline'}
            onClick={() => setDialogOpen(true)}
          >
            {isPaused
              ? t('subscription.trialBanner.reactivate')
              : t('subscription.trialBanner.addPayment')}
          </Button>
        </div>
      </div>

      <AddPaymentMethodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subscriptionId={subscription.id}
      />
    </>
  );
};
