import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer, Stack, Grid } from '@/components/layout';
import { OrganizationCard } from '@/components/features/organizations/OrganizationCard';
import { OrganizationFilters } from '@/components/features/organizations/OrganizationFilters';
import { OrganizationCardSkeleton } from '@/components/features/organizations/OrganizationCardSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import type { OrgRole, OrganizationMembership } from '@/types/organization';

/**
 * OrganizationSelectPage - Select and switch between organizations
 * 
 * Features:
 * - Display all organizations user is a member of
 * - Filter by role (Owner, Manager, Staff, All)
 * - Search by organization name
 * - Select organization to work with
 * - Create new organization button
 * - Handles redirect after selection
 */
export const OrganizationSelectPage: React.FC = () =>
{
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const { 
    currentOrg, 
    organizations, 
    switchOrganization, 
    isLoading, 
    error,
  } = useOrganizations();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<OrgRole | 'all'>('all');

  /**
   * Filter and search organizations
   */
  const filteredOrganizations = useMemo(() =>
  {
    let filtered = organizations;

    // Filter by role
    if (roleFilter !== 'all')
    {
      filtered = filtered.filter((orgWithRole) => orgWithRole.role === roleFilter);
    }

    // Filter by search query
    if (searchQuery.trim())
    {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((orgWithRole) =>
        orgWithRole.org.name.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [organizations, roleFilter, searchQuery]);

  /**
   * Handle organization selection
   */
  const handleSelectOrganization = (orgMembership: OrganizationMembership) =>
  {
    switchOrganization(orgMembership, redirectTo || undefined);
  };

  const loadingComponent = (
    <Stack space="lg">
      {/* Loading Skeletons */}
      <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
        <OrganizationCardSkeleton />
        <OrganizationCardSkeleton />
        <OrganizationCardSkeleton />
        <OrganizationCardSkeleton />
      </Grid>
    </Stack>
  );

  const errorComponent = (
    <Stack space="lg">
      {/* Error Display */}
      <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
        <ErrorState
          title={t('organizations.errors.loadFailed')}
          description={t('organizations.errors.loadFailedDescription')}
          onRetry={() => window.location.reload()}
          retryLabel={t('common.tryAgain')}
        />
      </Grid>
    </Stack>
  );

  /**
   * Main Content
   */
  return (
    <PageContainer>
      <Stack space="lg">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('organizations.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('organizations.selectDescription')}
          </p>
        </div>

        {/* Header: Filters + Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <OrganizationFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
            />
          </div>
          <Button
            onClick={() => {/* send to create org page or open dialog */}}
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('organizations.createOrganization')}</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>


        {/* Organizations List */}
        { isLoading ? (
          loadingComponent
        ) : error ? errorComponent : (
          // Organization List or Empty States
          filteredOrganizations.length === 0 ? (
            organizations.length === 0 ? (
              // No organizations at all
              <EmptyState
                icon={Building2}
                title={t('organizations.noOrganizations')}
                description={t('organizations.noOrganizationsDescription')}
                action={{
                  label: t('organizations.createOrganization'),
                  onClick: () => {/* send to create org page or open dialog */},
                }}
                size="lg"
              />
            ) : (
              // No results from filters
              <EmptyState
                icon={Building2}
                title={t('organizations.noResults')}
                description={t('organizations.noResultsDescription')}
                size="md"
              />
            )
          ) : (
            // Organization List
            <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
              {filteredOrganizations.map((orgWithRole) => (
                <OrganizationCard
                  key={orgWithRole.org.id}
                  organization={orgWithRole}
                  onSelect={handleSelectOrganization}
                  isSelected={currentOrg?.org.id === orgWithRole.org.id}
                />
              ))}
            </Grid>
          )
        )}
      </Stack>
    </PageContainer>
  );
};
