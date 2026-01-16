import React from 'react';
import { CreditCard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { formatDate } from '@/lib/date';
import { useAuthStore } from '@/stores/authStore';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import type { Subscription, SubscriptionStatus, SubscriptionStatusOnly } from '@/types/subscription';

/**
 * Type guard to check if we have full subscription data
 */
const isFullSubscription = (data: Subscription | SubscriptionStatusOnly): data is Subscription =>
{
  return 'billingInterval' in data;
};

interface SubscriptionCardProps
{
  /** Full subscription data (owner) or status-only data (non-owner) */
  subscriptionData: Subscription | SubscriptionStatusOnly;
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
  case 'CANCELED':
  case 'PAUSED':
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
  const statusMessage = useStatusMessage(subscriptionData.status, t);
  const hasFullData = isFullSubscription(subscriptionData);

  const formattedDate = hasFullData && subscriptionData.nextBillingDate
    ? formatDate(subscriptionData.nextBillingDate, currentLanguage, undefined, currentUser?.timezone)
    : null;

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
          {isOwner && hasFullData && (
            <Stack direction="horizontal" space="sm" className="pt-2 flex-wrap">
              <Button variant="outline" size="sm" disabled>
                <Settings className="w-4 h-4 mr-2" />
                {t('orgManagement.subscription.manage')}
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};