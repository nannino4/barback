import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Mail, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { OrganizationOverviewTab } from '@/components/features/organizations/tabs/OrganizationOverviewTab';
import { OrganizationMembersTab } from '@/components/features/organizations/tabs/OrganizationMembersTab';
import { OrganizationInvitationsTab } from '@/components/features/organizations/tabs/OrganizationInvitationsTab';
import { OrganizationSubscriptionTab } from '@/components/features/organizations/tabs/OrganizationSubscriptionTab';
import { PageContainer, Stack } from '@/components/layout';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useI18n } from '@/hooks/useI18n';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/api/organization-api';
import { RoleBadge } from '@/components/features/organizations/RoleBadge';
import { useOrganizationStore } from '@/stores/organizationStore';

// Tab components will be created next
// import { OrganizationOverviewTab } from '@/components/features/organizations/tabs/OrganizationOverviewTab';
// import { OrganizationMembersTab } from '@/components/features/organizations/tabs/OrganizationMembersTab';
// import { OrganizationInvitationsTab } from '@/components/features/organizations/tabs/OrganizationInvitationsTab';
// import { OrganizationSubscriptionTab } from '@/components/features/organizations/tabs/OrganizationSubscriptionTab';

type TabValue = 'overview' | 'members' | 'invitations' | 'subscription';

/**
 * OrganizationManagePage - Tabbed interface for managing owned organization
 * 
 * Features:
 * - 4 tabs: Overview, Members, Invitations, Subscription
 * - Owner-only access (enforced by route guard)
 * - Tab navigation via URL query params
 * - Responsive mobile-first design
 */
export const OrganizationManagePage: React.FC = () =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentOrg } = useOrganizationStore();

  // Get active tab from URL or default to overview
  const tabParam = searchParams.get('tab') as TabValue;
  const [activeTab, setActiveTab] = useState<TabValue>(
    tabParam && ['overview', 'members', 'invitations', 'subscription'].includes(tabParam)
      ? tabParam
      : 'overview',
  );

  /**
   * Fetch organization details
   */
  const organizationQuery = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => organizationApi.getOrganizationById(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Update URL when tab changes
   */
  useEffect(() =>
  {
    if (activeTab !== tabParam)
    {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, tabParam, setSearchParams]);

  /**
   * Sync tab state with URL
   */
  useEffect(() =>
  {
    if (tabParam && tabParam !== activeTab)
    {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  /**
   * Handle back navigation
   */
  const handleBack = () =>
  {
    void navigate('/organizations');
  };

  /**
   * Get user's role in this organization
   */
  const userRole = (currentOrg && currentOrg.org.id === orgId) ? currentOrg.role : null;
  const isOwner = userRole === 'OWNER';
  const canInvite = userRole === 'OWNER' || userRole === 'MANAGER';

  /**
   * Loading State
   */
  if (organizationQuery.isLoading)
  {
    return (
      <PageContainer className="py-6">
        <Stack space="lg">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>

          {/* Loading message */}
          <div className="text-center py-12 text-muted-foreground">
            {t('common.loading')}
          </div>
        </Stack>
      </PageContainer>
    );
  }

  /**
   * Error State
   */
  if (organizationQuery.error || !organizationQuery.data)
  {
    return (
      <PageContainer className="py-6">
        <Stack space="lg">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>

          {/* Error display */}
          <ErrorState
            title={t('organizations.errors.loadFailed')}
            description={t('organizations.errors.loadFailedDescription')}
            onRetry={() => void organizationQuery.refetch()}
            isRetrying={organizationQuery.isFetching}
            retryLabel={t('common.tryAgain')}
          />
        </Stack>
      </PageContainer>
    );
  }

  const organization = organizationQuery.data;

  /**
   * Main Content
   */
  return (
    <PageContainer className="py-6">
      <Stack space="lg">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="-ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {organization.name}
              </h1>
              {userRole && (
                <div className="mt-2">
                  <RoleBadge role={userRole} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span>{t('orgManagement.tabs.overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              <span>{t('orgManagement.tabs.members')}</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              <Mail className="w-4 h-4" />
              <span>{t('orgManagement.tabs.invitations')}</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span>{t('orgManagement.tabs.subscription')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OrganizationOverviewTab organization={organization} orgId={organization.id} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <OrganizationMembersTab orgId={organization.id} isOwner={isOwner} />
          </TabsContent>

          <TabsContent value="invitations" className="mt-6">
            <OrganizationInvitationsTab orgId={organization.id} canInvite={canInvite} />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <OrganizationSubscriptionTab orgId={organization.id} />
          </TabsContent>
        </Tabs>
      </Stack>
    </PageContainer>
  );
};
