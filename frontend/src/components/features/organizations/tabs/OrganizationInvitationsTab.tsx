import React, { useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Stack, Grid } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { PendingInvitationCard } from '@/components/features/organizations/PendingInvitationCard';
import { SendInvitationDialog } from '@/components/features/organizations/SendInvitationDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { OrganizationCardSkeleton } from '@/components/features/organizations/OrganizationCardSkeleton';
import { useI18n } from '@/hooks/useI18n';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationApi } from '@/api/invitation-api';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/lib/cacheTimes';

interface OrganizationInvitationsTabProps
{
  orgId: string;
  canInvite: boolean; // Owner or Manager can send invitations
}

/**
 * OrganizationInvitationsTab - Display and manage organization invitations
 * 
 * Features:
 * - List all pending invitations with PendingInvitationCard
 * - Send new invitation button (opens dialog)
 * - Revoke invitation functionality
 * - Loading and error states
 * - Empty state when no invitations
 */
export const OrganizationInvitationsTab: React.FC<OrganizationInvitationsTabProps> = ({
  orgId,
  canInvite,
}) =>
{
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // Dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  
  // Track which invitation is being revoked
  const [revokingId, setRevokingId] = useState<string | null>(null);

  /**
   * Fetch organization invitations
   */
  const invitationsQuery = useQuery({
    queryKey: queryKeys.organizations.invitations(orgId),
    queryFn: () => invitationApi.getOrganizationInvitations(orgId),
    staleTime: CACHE_TIMES.INVITATIONS,
  });

  /**
   * Revoke invitation mutation
   */
  const revokeInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => invitationApi.revokeInvitation(orgId, invitationId),
    onSuccess: () =>
    {
      // Invalidate queries to refetch data
      void queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.invitations(orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.organizations.detail(orgId),
      });

      toast.success(t('invitations.revoke.success'));
      
      setRevokingId(null);
    },
    onError: () =>
    {
      toast.error(t('invitations.revoke.error'));
      
      setRevokingId(null);
    },
  });

  /**
   * Handle revoke invitation
   */
  const handleRevokeInvitation = (invitationId: string) =>
  {
    setRevokingId(invitationId);
    revokeInvitationMutation.mutate(invitationId);
  };

  /**
   * Loading State
   */
  if (invitationsQuery.isLoading)
  {
    return (
      <Stack space="md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {t('invitations.pendingInvitations')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('common.loading')}
            </p>
          </div>
          {canInvite && (
            <Button onClick={() => setSendDialogOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              {t('invitations.send.sendButton')}
            </Button>
          )}
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
  if (invitationsQuery.error || !invitationsQuery.data)
  {
    return (
      <Stack space="md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {t('invitations.pendingInvitations')}
            </h3>
          </div>
          {canInvite && (
            <Button onClick={() => setSendDialogOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              {t('invitations.send.sendButton')}
            </Button>
          )}
        </div>
        <ErrorState
          title={t('invitations.errors.loadFailed')}
          description={t('invitations.errors.loadFailedDescription')}
          onRetry={() => void invitationsQuery.refetch()}
          isRetrying={invitationsQuery.isFetching}
          retryLabel={t('common.tryAgain')}
        />

        {/* Send Invitation Dialog */}
        {canInvite && (
          <SendInvitationDialog
            orgId={orgId}
            open={sendDialogOpen}
            onOpenChange={setSendDialogOpen}
          />
        )}
      </Stack>
    );
  }

  const invitations = invitationsQuery.data;

  /**
   * Main Content
   */
  return (
    <Stack space="md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            {t('invitations.pendingInvitations')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {invitations.length > 0
              ? t('invitations.pendingCount', { count: invitations.length })
              : t('organizations.noInvitations')
            }
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setSendDialogOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            <span>{t('invitations.send.sendButton')}</span>
          </Button>
        )}
      </div>

      {/* Invitations List or Empty State */}
      {invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={t('organizations.noInvitations')}
          description={t('organizations.noInvitationsDescription')}
          action={canInvite ? {
            label: t('invitations.send.sendButton'),
            onClick: () => setSendDialogOpen(true),
          } : undefined}
          size="md"
        />
      ) : (
        <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
          {invitations.map((invitation) => (
            <PendingInvitationCard
              key={invitation.id}
              invitation={invitation}
              onRevoke={handleRevokeInvitation}
              isRevoking={revokingId === invitation.id}
            />
          ))}
        </Grid>
      )}

      {/* Send Invitation Dialog */}
      {canInvite && (
        <SendInvitationDialog
          orgId={orgId}
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
        />
      )}
    </Stack>
  );
};
