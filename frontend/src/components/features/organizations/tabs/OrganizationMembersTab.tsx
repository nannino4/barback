import React, { useState } from 'react';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Stack, Grid } from '@/components/layout';
import { MemberCard } from '@/components/features/organizations/MemberCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { OrganizationCardSkeleton } from '@/components/features/organizations/OrganizationCardSkeleton';
import { useI18n } from '@/hooks/useI18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/api/organization-api';
import { useAuthStore } from '@/stores/authStore';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/lib/cacheTimes';

interface OrganizationMembersTabProps
{
  orgId: string;
  isOwner: boolean;
}

/**
 * OrganizationMembersTab - Display and manage organization members
 * 
 * Features:
 * - List all organization members with MemberCard
 * - Display current user's role
 * - Owner can remove members (except themselves)
 * - Loading and error states
 * - Empty state when no members (shouldn't happen normally)
 */
export const OrganizationMembersTab: React.FC<OrganizationMembersTabProps> = ({
  orgId,
  isOwner,
}) =>
{
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id ?? '';

  // Track which member is being removed
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  /**
   * Fetch organization members
   */
  const membersQuery = useQuery({
    queryKey: queryKeys.organizations.members(orgId),
    queryFn: () => organizationApi.getOrganizationMembers(orgId),
    staleTime: CACHE_TIMES.ORGANIZATION_MEMBERS,
  });

  /**
   * Remove member mutation
   */
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => organizationApi.removeMember(orgId, userId),
    onSuccess: () =>
    {
      // Invalidate queries to refetch data
      void queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.members(orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(orgId),
      });

      toast.success(t('members.remove.success'));
      
      setRemovingUserId(null);
    },
    onError: () =>
    {
      toast.error(t('members.remove.error'));
      
      setRemovingUserId(null);
    },
  });

  /**
   * Handle remove member
   */
  const handleRemoveMember = (userId: string) =>
  {
    if (userId === currentUserId)
    {
      toast.error(t('members.remove.cannotRemoveSelf'));
      return;
    }

    setRemovingUserId(userId);
    removeMemberMutation.mutate(userId);
  };

  /**
   * Loading State
   */
  if (membersQuery.isLoading)
  {
    return (
      <Stack space="md">
        <div>
          <h3 className="text-lg font-semibold">
            {t('members.title')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('common.loading')}
          </p>
        </div>
        <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
          <OrganizationCardSkeleton />
          <OrganizationCardSkeleton />
          <OrganizationCardSkeleton />
          <OrganizationCardSkeleton />
        </Grid>
      </Stack>
    );
  }

  /**
   * Error State
   */
  if (membersQuery.error || !membersQuery.data)
  {
    return (
      <Stack space="md">
        <div>
          <h3 className="text-lg font-semibold">
            {t('members.title')}
          </h3>
        </div>
        <ErrorState
          title={t('organizations.errors.loadFailed')}
          description={t('organizations.errors.loadFailedDescription')}
          onRetry={() => void membersQuery.refetch()}
          isRetrying={membersQuery.isFetching}
          retryLabel={t('common.tryAgain')}
        />
      </Stack>
    );
  }

  const members = membersQuery.data;

  /**
   * Empty State (unlikely but handle it)
   */
  if (members.length === 0)
  {
    return (
      <Stack space="md">
        <div>
          <h3 className="text-lg font-semibold">
            {t('members.title')}
          </h3>
        </div>
        <EmptyState
          icon={Users}
          title={t('members.noMembers')}
          description={t('organizations.errors.loadFailedDescription')}
          size="md"
        />
      </Stack>
    );
  }

  /**
   * Main Content
   */
  return (
    <Stack space="md">
      <div>
        <h3 className="text-lg font-semibold">
          {t('members.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('members.count', { count: members.length })}
        </p>
      </div>

      <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
        {members.map((member) => (
          <MemberCard
            key={member.user.id}
            member={member}
            currentUserId={currentUserId}
            isOwner={isOwner}
            onRemove={isOwner ? handleRemoveMember : undefined}
            isRemoving={removingUserId === member.user.id}
          />
        ))}
      </Grid>
    </Stack>
  );
};
