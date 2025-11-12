import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { PageContainer, Stack, Grid } from '@/components/layout';
import { OrganizationCard } from '@/components/features/organizations/OrganizationCard';
import { OrganizationCardSkeleton } from '@/components/features/organizations/OrganizationCardSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import type { OrgRole, OrganizationMembership } from '@/types/organization';

/**
 * OrganizationsPage - View and manage all organizations user is a member of
 * 
 * Features:
 * - Display all organizations user is a member of
 * - Filter by role using toggle-style filters (All, Owner, Manager, Staff)
 * - Search by organization name
 * - Select organization to work with (without redirect)
 * - Create new organization button
 */
export const OrganizationsPage: React.FC = () =>
{
  const { t } = useI18n();
  const navigate = useNavigate();

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
   * Handle organization selection (no redirect)
   */
  const handleSelectOrganization = (orgMembership: OrganizationMembership) =>
  {
    switchOrganization(orgMembership);
  };

  /**
   * Navigate to organization creation page
   */
  const handleCreateOrganization = () =>
  {
    void navigate('/organizations/create');
  };

  /**
   * Get role label for display
   */
  const getRoleLabel = (role: OrgRole | 'all'): string =>
  {
    if (role === 'all')
    {
      return t('organizations.role.all');
    }
    const roleKey = role.toLowerCase() as 'owner' | 'manager' | 'staff';
    return t(`organizations.role.${roleKey}`);
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
          <h1 className="text-xl sm:text-2xl font-semibold">
            {t('organizations.myVenues')}
          </h1>
          {!currentOrg && (
            <p className="text-muted-foreground mt-2">
              {t('organizations.selectDescription')}
            </p>
          )}
        </div>

        {/* Header: Filters + Create Button */}
        <div className="flex flex-col gap-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('organizations.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              onClick={handleCreateOrganization}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t('organizations.createOrganization')}</span>
            </Button>
          </div>

          {/* Chip-style Role Filters */}
          <div className="flex flex-wrap gap-2">

            {/* All Roles Filter */}
            <Toggle
              pressed={roleFilter === 'all'}
              onPressedChange={(pressed) => pressed && setRoleFilter('all')}
            >
              {getRoleLabel('all')}
            </Toggle>

            {/* Owner Filter */}
            <Toggle
              pressed={roleFilter === 'OWNER'}
              onPressedChange={(pressed) => setRoleFilter(pressed ? 'OWNER' : 'all')}
            >
              {getRoleLabel('OWNER')}
            </Toggle>

            {/* Manager Filter */}
            <Toggle
              pressed={roleFilter === 'MANAGER'}
              onPressedChange={(pressed) => setRoleFilter(pressed ? 'MANAGER' : 'all')}
            >
              {getRoleLabel('MANAGER')}
            </Toggle>

            {/* Staff Filter */}
            <Toggle
              pressed={roleFilter === 'STAFF'}
              onPressedChange={(pressed) => setRoleFilter(pressed ? 'STAFF' : 'all')}
            >
              {getRoleLabel('STAFF')}
            </Toggle>
          </div>
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
                  onClick: handleCreateOrganization,
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
