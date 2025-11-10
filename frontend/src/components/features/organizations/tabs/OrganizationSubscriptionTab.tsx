import React from 'react';
import { CreditCard, AlertCircle, Info } from 'lucide-react';
import { Stack } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusMessage } from '@/components/feedback/StatusMessage';
import { useI18n } from '@/hooks/useI18n';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/api/organization-api';
import { subscriptionApi } from '@/api/subscription-api';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { SubscriptionStatus } from '@/types/subscription';

interface OrganizationSubscriptionTabProps
{
  orgId: string;
}

/**
 * OrganizationSubscriptionTab - Display subscription status and billing information
 * 
 * Features:
 * - Subscription status display with badge
 * - Payment failure alerts (Past Due, Unpaid)
 * - Subscription plan details
 * - Placeholder for future payment method management
 * 
 * Note: Payment method management (add/remove/set default) will be added
 * when backend APIs are available.
 */
export const OrganizationSubscriptionTab: React.FC<OrganizationSubscriptionTabProps> = ({
  orgId,
}) =>
{
  const { t } = useI18n();

  /**
   * Fetch organization details to get subscription ID
   */
  const organizationQuery = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => organizationApi.getOrganizationById(orgId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Fetch all subscriptions (to find this org's subscription)
   */
  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionApi.getSubscriptions(),
    enabled: !!organizationQuery.data,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  /**
   * Get subscription status badge configuration
   */
  const getStatusConfig = (status: SubscriptionStatus) =>
  {
    const configs = {
      TRIALING: {
        label: t('subscription.status.trialing'),
        className: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      },
      ACTIVE: {
        label: t('subscription.status.active'),
        className: 'bg-success/10 text-success border-success/20',
      },
      PAST_DUE: {
        label: t('subscription.status.past_due'),
        className: 'bg-warning/10 text-warning border-warning/20',
      },
      CANCELED: {
        label: t('subscription.status.canceled'),
        className: 'bg-muted text-muted-foreground border-border',
      },
      UNPAID: {
        label: t('subscription.status.unpaid'),
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
      INCOMPLETE: {
        label: t('subscription.status.incomplete'),
        className: 'bg-warning/10 text-warning border-warning/20',
      },
      INCOMPLETE_EXPIRED: {
        label: t('subscription.status.incomplete_expired'),
        className: 'bg-muted text-muted-foreground border-border',
      },
      PAUSED: {
        label: t('subscription.status.paused'),
        className: 'bg-muted text-muted-foreground border-border',
      },
    };

    return configs[status] || configs.ACTIVE;
  };

  /**
   * Check if subscription has payment issues
   */
  const hasPaymentIssue = (status: SubscriptionStatus) =>
  {
    return status === 'PAST_DUE' || status === 'UNPAID';
  };

  /**
   * Loading State
   */
  if (organizationQuery.isLoading || subscriptionsQuery.isLoading)
  {
    return (
      <Stack space="md">
        <div>
          <h3 className="text-lg font-semibold">
            {t('orgManagement.subscription.title')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('common.loading')}
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <Stack space="md">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  /**
   * Error State
   */
  if (organizationQuery.error || subscriptionsQuery.error || !subscriptionsQuery.data)
  {
    return (
      <Stack space="md">
        <div>
          <h3 className="text-lg font-semibold">
            {t('orgManagement.subscription.title')}
          </h3>
        </div>
        <StatusMessage
          variant="error"
          title={t('subscription.errors.notFound')}
        />
      </Stack>
    );
  }

  // For now, we'll show the first subscription (simplified approach)
  // In a full implementation, we'd match by organization's subscriptionId
  const subscription = subscriptionsQuery.data[0];

  if (!subscription)
  {
    return (
      <Stack space="md">
        <div>
          <h3 className="text-lg font-semibold">
            {t('orgManagement.subscription.title')}
          </h3>
        </div>
        <StatusMessage
          variant="info"
          title={t('subscription.errors.notFound')}
        />
      </Stack>
    );
  }

  const statusConfig = getStatusConfig(subscription.status);
  const showPaymentAlert = hasPaymentIssue(subscription.status);

  /**
   * Main Content
   */
  return (
    <Stack space="md">
      <div>
        <h3 className="text-lg font-semibold">
          {t('orgManagement.subscription.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('orgManagement.subscription.description')}
        </p>
      </div>

      {/* Payment Failure Alert */}
      {showPaymentAlert && (
        <StatusMessage
          variant="error"
          title={t('orgManagement.subscription.paymentFailedMessage')}
          icon={AlertCircle}
        />
      )}

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('orgManagement.subscription.statusTitle')}</CardTitle>
          <CardDescription>
            {t('orgManagement.subscription.statusDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stack space="md">
            {/* Status Badge */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('orgManagement.subscription.currentStatus')}
              </label>
              <div className="mt-2">
                <span className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
                  statusConfig.className,
                )}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Auto-renewal Status */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('orgManagement.subscription.autoRenewal')}
              </label>
              <p className="text-base mt-1">
                {subscription.autoRenew
                  ? t('orgManagement.subscription.autoRenewEnabled')
                  : t('orgManagement.subscription.autoRenewDisabled')
                }
              </p>
            </div>

            {/* Created Date */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('orgManagement.subscription.createdOn')}
              </label>
              <p className="text-base mt-1">
                {new Date(subscription.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </Stack>
        </CardContent>
      </Card>

      {/* Payment Methods Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t('orgManagement.subscription.paymentMethodsTitle')}
              </CardTitle>
              <CardDescription className="mt-1.5">
                {t('orgManagement.subscription.paymentMethodsDescription')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StatusMessage
            variant="info"
            title={t('orgManagement.subscription.paymentMethodsComingSoon')}
            icon={Info}
          />
        </CardContent>
      </Card>
    </Stack>
  );
};
