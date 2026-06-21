import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { formatDate, daysUntil } from '@/lib/date';
import { useAuthStore } from '@/stores/authStore';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { AddPaymentMethodDialog } from './AddPaymentMethodDialog';
import type { SubscriptionResponse, SubscriptionStatus, SubscriptionStatusOnlyResponse } from '@/types/subscription';

/**
 * Type guard to check if we have full subscription data
 */
const isFullSubscription = (data: SubscriptionResponse | SubscriptionStatusOnlyResponse): data is SubscriptionResponse =>
{
  return 'billingInterval' in data;
};

interface SubscriptionCardProps
{
  /** Full subscription data (owner) or status-only data (non-owner) */
  subscriptionData: SubscriptionResponse | SubscriptionStatusOnlyResponse;
  /** Whether the current user is the organization owner */
  isOwner: boolean;
}

/**
 * Get status message for a subscription status
 */
const useStatusMessage = (status: SubscriptionStatus, t: ReturnType<typeof useI18n>['t']): string | null =>
{
  switch (status)
  {
  case 'ACTIVE':
    return t('orgManagement.subscription.statusMessages.active');
  case 'TRIALING':
    return t('orgManagement.subscription.statusMessages.trialing');
  case 'INCOMPLETE':
  case 'INCOMPLETE_EXPIRED':
    return t('orgManagement.subscription.statusMessages.incomplete');
  case 'PAST_DUE':
    return t('orgManagement.subscription.statusMessages.pastDue');
  case 'PAUSED':
    return t('orgManagement.subscription.statusMessages.paused');
  case 'CANCELED':
    return t('orgManagement.subscription.statusMessages.canceled');
  case 'UNPAID':
    return t('orgManagement.subscription.statusMessages.unpaid');
  default:
    return null;
  }
};

/**
 * SubscriptionCard - Displays subscription information for an organization
 * 
 * For owners (full subscription data):
 * - Subscription status badge
 * - Status message
 * - Billing interval
 * - Renewal/end date
 * - Management actions
 * 
 * For non-owners (status only):
 * - Subscription status badge
 * - Status message
 */
export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscriptionData,
  isOwner,
}) =>
{
  const { t, currentLanguage } = useI18n();
  const currentUser = useAuthStore((state) => state.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const statusMessage = useStatusMessage(subscriptionData.status, t);
  const hasFullData = isFullSubscription(subscriptionData);

  const formattedDate = hasFullData && subscriptionData.nextBillingDate
    ? formatDate(subscriptionData.nextBillingDate, currentLanguage, undefined, currentUser?.timezone)
    : null;

  const isTrialing = subscriptionData.status === 'TRIALING';
  const isPaused = subscriptionData.status === 'PAUSED';
  const trialDaysRemaining = hasFullData && isTrialing
    ? daysUntil(subscriptionData.nextBillingDate)
    : null;
  // Owners can add a payment method to convert a trial or reactivate a paused sub.
  const canAddPayment = isOwner && hasFullData && (isTrialing || isPaused);

  return (
    <Card>
      <CardHeader>
        <Stack direction="horizontal" justify="between" align="center" className="flex-wrap gap-2">
          <Stack direction="horizontal" space="sm" align="center">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <CardTitle>{t('orgManagement.subscription.title')}</CardTitle>
          </Stack>
          <SubscriptionStatusBadge status={subscriptionData.status} />
        </Stack>
      </CardHeader>
      <CardContent>
        <Stack space="md">
          {/* Status Message */}
          {statusMessage && (
            <p className="text-sm text-muted-foreground">
              {statusMessage}
            </p>
          )}

          {/* Trial countdown */}
          {trialDaysRemaining !== null && (
            <p className="text-sm font-medium">
              {t('subscription.trialBanner.daysLeft' as never, { days: trialDaysRemaining }) as string}
            </p>
          )}

          {/* Subscription Details - only shown for owners with full data */}
          {hasFullData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Billing Interval */}
              <div>
                <span className="text-muted-foreground">
                  {t('orgManagement.subscription.billingInterval')}:
                </span>
                <span className="ml-2 font-medium">
                  {subscriptionData.billingInterval === 'MONTHLY' 
                    ? t('orgManagement.subscription.monthly')
                    : t('orgManagement.subscription.yearly')}
                </span>
              </div>

              {/* Renewal/End text - only label is muted, date is normal */}
              {formattedDate && (
                <div>
                  <span className="text-muted-foreground">
                    {subscriptionData.autoRenew
                      ? t('orgManagement.subscription.renewsOn')
                      : t('orgManagement.subscription.endsOn')}
                  </span>
                  <span className="ml-1 font-medium">
                    {formattedDate}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons for owner */}
          {canAddPayment && hasFullData && (
            <Stack direction="horizontal" space="sm" className="pt-2 flex-wrap">
              <Button
                variant={isPaused ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isPaused
                  ? t('subscription.trialBanner.reactivate')
                  : t('subscription.trialBanner.addPayment')}
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>

      {canAddPayment && hasFullData && (
        <AddPaymentMethodDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          subscriptionId={subscriptionData.id}
        />
      )}
    </Card>
  );
};