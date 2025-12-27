import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Users, CreditCard, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer, Stack, Grid, Section } from '@/components/layout';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/feedback/ErrorState';
import { SubscriptionStatusBadge } from '@/components/features/organizations/SubscriptionStatusBadge';
import { MemberCard } from '@/components/features/organizations/MemberCard';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { organizationApi } from '@/api/organization-api';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';
import type { SubscriptionStatus } from '@/types/subscription';

/**
 * OrganizationManagePage - Management page for a single organization
 * 
 * Shows:
 * - Organization details (name, settings)
 * - Subscription status and info
 * - Team members list
 * 
 * Access: Owner, Manager, Staff (different features based on role)
 */
export const OrganizationManagePage: React.FC = () =>
{
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const currentUser = useAuthStore((state) => state.user);

  // Fetch organization details
  const {
    data: organization,
    isLoading: isLoadingOrg,
    error: orgError,
    refetch: refetchOrg,
  } = useQuery({
    queryKey: queryKeys.organizations.detail(orgId ?? ''),
    queryFn: () => organizationApi.getOrganizationById(orgId ?? ''),
    enabled: Boolean(orgId),
    staleTime: CACHE_TIMES.ORGANIZATIONS,
  });

  // Fetch organization subscription
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: queryKeys.organizations.subscription(orgId ?? ''),
    queryFn: () => organizationApi.getOrganizationSubscription(orgId ?? ''),
    enabled: Boolean(orgId),
    staleTime: CACHE_TIMES.ORGANIZATIONS,
  });

  // Fetch organization members
  const {
    data: members,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: queryKeys.organizations.members(orgId ?? ''),
    queryFn: () => organizationApi.getOrganizationMembers(orgId ?? ''),
    enabled: Boolean(orgId),
    staleTime: CACHE_TIMES.ORGANIZATIONS,
  });

  const isLoading = isLoadingOrg || isLoadingSubscription || isLoadingMembers;
  const error = orgError ?? subscriptionError ?? membersError;

  // Find current user's role in this org
  const currentUserMembership = members?.find(
    (m) => m.user.id === currentUser?.id,
  );
  const isOwner = currentUserMembership?.role === 'OWNER';

  const handleBack = () =>
  {
    void navigate('/orgs');
  };

  const handleRefresh = () =>
  {
    void refetchOrg();
    void refetchSubscription();
    void refetchMembers();
  };

  /**
   * Get subscription status info for display
   */
  const getSubscriptionInfo = (status: SubscriptionStatus) =>
  {
    switch (status)
    {
    case 'ACTIVE':
      return {
        variant: 'success' as const,
        message: t('orgManagement.subscription.statusMessages.active'),
      };
    case 'TRIALING':
      return {
        variant: 'info' as const,
        message: t('orgManagement.subscription.statusMessages.trialing'),
      };
    case 'INCOMPLETE':
      return {
        variant: 'warning' as const,
        message: t('orgManagement.subscription.statusMessages.incomplete'),
      };
    case 'PAST_DUE':
      return {
        variant: 'destructive' as const,
        message: t('orgManagement.subscription.statusMessages.pastDue'),
      };
    case 'CANCELED':
      return {
        variant: 'default' as const,
        message: t('orgManagement.subscription.statusMessages.canceled'),
      };
    case 'UNPAID':
      return {
        variant: 'destructive' as const,
        message: t('orgManagement.subscription.statusMessages.unpaid'),
      };
    default:
      return {
        variant: 'default' as const,
        message: '',
      };
    }
  };

  // Loading state
  if (isLoading)
  {
    return (
      <PageContainer className="py-6">
        <Stack space="lg" className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" text={t('common.loading')} />
          </div>
        </Stack>
      </PageContainer>
    );
  }

  // Error state
  if (error || !organization || !subscription)
  {
    return (
      <PageContainer className="py-6">
        <Stack space="lg" className="max-w-4xl mx-auto">
          <ErrorState
            title={t('organizations.errors.loadFailed')}
            description={t('organizations.errors.loadFailedDescription')}
            onRetry={handleRefresh}
            retryLabel={t('common.tryAgain')}
          />
        </Stack>
      </PageContainer>
    );
  }

  const subscriptionInfo = getSubscriptionInfo(subscription.status);

  return (
    <PageContainer className="py-6">
      <Stack space="lg" className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('common.back')}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-muted-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            {t('common.refresh')}
          </Button>
        </div>

        {/* Organization Header */}
        <Section>
          <Stack direction="horizontal" space="lg" align="center" className="flex-wrap">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <Stack space="xs" className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                {organization.name}
              </h1>
              <p className="text-muted-foreground">
                {t('orgManagement.description')}
              </p>
            </Stack>
          </Stack>
        </Section>

        {/* Subscription Section */}
        <Section>
          <Card variant={subscriptionInfo.variant}>
            <CardHeader>
              <Stack direction="horizontal" justify="between" align="center" className="flex-wrap gap-2">
                <Stack direction="horizontal" space="sm" align="center">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>{t('orgManagement.subscription.title')}</CardTitle>
                </Stack>
                <SubscriptionStatusBadge status={subscription.status} />
              </Stack>
            </CardHeader>
            <CardContent>
              <Stack space="md">
                {/* Status Message */}
                {subscriptionInfo.message && (
                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo.message}
                  </p>
                )}

                {/* Subscription Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t('orgManagement.subscription.autoRenew')}:
                    </span>
                    <span className="ml-2 font-medium">
                      {subscription.autoRenew
                        ? t('common.yes')
                        : t('common.no')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t('orgManagement.subscription.createdAt')}:
                    </span>
                    <span className="ml-2 font-medium">
                      {new Date(subscription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action buttons for owner */}
                {isOwner && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" disabled>
                      <Settings className="w-4 h-4 mr-2" />
                      {t('orgManagement.subscription.manage')}
                    </Button>
                  </div>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Section>

        {/* Members Section */}
        <Section>
          <Card>
            <CardHeader>
              <Stack direction="horizontal" justify="between" align="center" className="flex-wrap gap-2">
                <Stack direction="horizontal" space="sm" align="center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>{t('orgManagement.members.title')}</CardTitle>
                </Stack>
                <span className="text-sm text-muted-foreground">
                  {t('organizations.members', { count: members?.length ?? 0 })}
                </span>
              </Stack>
              <CardDescription>
                {t('orgManagement.members.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space="md">
                {members && members.length > 0 ? (
                  <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                    {members.map((member) => (
                      <MemberCard
                        key={member.user.id}
                        member={member}
                        currentUserId={currentUser?.id ?? ''}
                        isOwner={isOwner}
                        // onRemove will be implemented later
                      />
                    ))}
                  </Grid>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('orgManagement.members.noMembers')}
                  </p>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Section>

        {/* Organization Settings Section (Owner only) */}
        {isOwner && (
          <Section>
            <Card>
              <CardHeader>
                <Stack direction="horizontal" space="sm" align="center">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>{t('orgManagement.settings.title')}</CardTitle>
                </Stack>
                <CardDescription>
                  {t('orgManagement.settings.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Stack space="md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {t('orgManagement.settings.currency')}:
                      </span>
                      <span className="ml-2 font-medium">
                        {organization.settings.defaultCurrency}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" disabled>
                      <Settings className="w-4 h-4 mr-2" />
                      {t('orgManagement.settings.edit')}
                    </Button>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </Section>
        )}
      </Stack>
    </PageContainer>
  );
};
