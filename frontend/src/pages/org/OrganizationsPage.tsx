import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { PageContainer, Stack, Grid } from '@/components/layout';
import { OrganizationCard } from '@/components/features/organizations/OrganizationCard';
import { OrganizationCardSkeleton } from '@/components/features/organizations/OrganizationCardSkeleton';
import { InvitationCard } from '@/components/features/organizations/InvitationCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useInvitations } from '@/hooks/useInvitations';
import type { OrgRole, OrganizationMembership } from '@/types/organization';

/**
 * OrganizationsPage - Hub for organization management
 * 
 * Sections:
 * 1. Pending Invitations (top) - grid layout
 * 2. My Venues - filterable list of organizations with selection
 */
export const OrganizationsPage: React.FC = () =>
{
  const { t } = useI18n();

  // Organizations state
  const { 
    currentOrg, 
    organizations, 
    switchOrganization, 
    isLoading: isLoadingOrgs, 
    error: orgsError,
  } = useOrganizations();

  // Invitations state
  const {
    pendingInvitations,
    acceptInvitation,
    declineInvitation,
    acceptingInvitationId,
    decliningInvitationId,
  } = useInvitations();

  // UI state
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

    // Always show current org first (within the filtered results)
    filtered = [...filtered].sort((a, b) =>
    {
      if (a.org.id === currentOrg?.org.id) return -1;
      if (b.org.id === currentOrg?.org.id) return 1;
      return 0;
    });

    return filtered;
  }, [organizations, roleFilter, searchQuery, currentOrg?.org.id]);

  /**
   * Handle organization selection
   */
  const handleSelectOrganization = (orgMembership: OrganizationMembership) =>
  {
    switchOrganization(orgMembership);
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

  const visiblePendingInvitations = pendingInvitations.filter(
    (inv) => new Date(inv.expiresAt) >= new Date(),
  );
  const hasInvitations = visiblePendingInvitations.length > 0;

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderInvitationsSection = () =>
  {
    if (!hasInvitations) return null;

    return (
      <section className="space-y-3">
        {/* Section Header */}
        <Stack direction="horizontal" space="sm" align="center">
          <h2 className="text-lg font-semibold">
            {t('invitations.pendingInvitations')}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({visiblePendingInvitations.length})
          </span>
        </Stack>

        {/* Invitations Display */}
        <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
          {visiblePendingInvitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onAccept={acceptInvitation}
              onDecline={declineInvitation}
              isAccepting={acceptingInvitationId === invitation.id}
              isDeclining={decliningInvitationId === invitation.id}
            />
          ))}
        </Grid>
      </section>
    );
  };

  const renderOrganizationsSection = () =>
  {
    return (
      <section className="space-y-4">
        {/* Section Header */}
        <Stack direction="horizontal" justify="between" align="center" className="flex-wrap gap-2">
          <h2 className="text-lg font-semibold">
            {t('organizations.myVenues')}
          </h2>
          <Button
            asChild
          >
            <Link to="/orgs/create">
              <Plus className="w-4 h-4" />
              <span>{t('organizations.createOrganization')}</span>
            </Link>
          </Button>
        </Stack>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative">
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
                aria-label={t('organizations.filters.clearFilters')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap gap-2">
            <Toggle
              pressed={roleFilter === 'all'}
              onPressedChange={(pressed) => pressed && setRoleFilter('all')}
            >
              {getRoleLabel('all')}
            </Toggle>
            <Toggle
              pressed={roleFilter === 'OWNER'}
              onPressedChange={(pressed) => setRoleFilter(pressed ? 'OWNER' : 'all')}
            >
              {getRoleLabel('OWNER')}
            </Toggle>
            <Toggle
              pressed={roleFilter === 'MANAGER'}
              onPressedChange={(pressed) => setRoleFilter(pressed ? 'MANAGER' : 'all')}
            >
              {getRoleLabel('MANAGER')}
            </Toggle>
            <Toggle
              pressed={roleFilter === 'STAFF'}
              onPressedChange={(pressed) => setRoleFilter(pressed ? 'STAFF' : 'all')}
            >
              {getRoleLabel('STAFF')}
            </Toggle>
          </div>
        </div>

        {/* Organizations List */}
        {isLoadingOrgs ? (
          <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
          </Grid>
        ) : orgsError ? (
          <ErrorState
            title={t('organizations.errors.loadFailed')}
            description={t('organizations.errors.loadFailedDescription')}
            onRetry={() => window.location.reload()}
            retryLabel={t('common.tryAgain')}
          />
        ) : filteredOrganizations.length === 0 ? (
          organizations.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={t('organizations.noOrganizations')}
              description={t('organizations.noOrganizationsDescription')}
              action={{
                label: t('organizations.createOrganization'),
                to: '/orgs/create',
              }}
              size="lg"
            />
          ) : (
            <EmptyState
              icon={Building2}
              title={t('organizations.noResults')}
              description={t('organizations.noResultsDescription')}
              size="md"
            />
          )
        ) : (
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
        )}
      </section>
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <PageContainer>
      <Stack space="xl">
        {/* Page Header - only show description when no org is selected */}
        {!currentOrg && (
          <p className="text-muted-foreground">
            {t('organizations.selectDescription')}
          </p>
        )}

        {/* Pending Invitations Section */}
        {renderInvitationsSection()}

        {/* Divider if both sections present */}
        {hasInvitations && <hr className="border-border" />}

        {/* My Venues Section */}
        {renderOrganizationsSection()}
      </Stack>
    </PageContainer>
  );
};
