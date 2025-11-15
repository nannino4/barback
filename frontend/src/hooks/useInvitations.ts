import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useOrganizationStore } from '@/stores/organizationStore';
import { invitationApi } from '@/api/invitation-api';
import { useI18n } from '@/hooks/useI18n';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';
import type { Invitation } from '@/types/invitation';

/**
 * Hook for managing invitations
 * Provides queries and mutations for invitation management
 */
export const useInvitations = () =>
{
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const {
    pendingInvitations,
    setPendingInvitations,
  } = useOrganizationStore();

  /**
   * Query to fetch pending invitations for the current user
   */
  const invitationsQuery = useQuery({
    queryKey: queryKeys.invitations.pending,
    queryFn: () => invitationApi.getPendingInvitations(),
    staleTime: CACHE_TIMES.INVITATIONS,
  });

  /**
   * Mutation to accept an invitation
   */
  const acceptInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => invitationApi.acceptInvitation(invitationId),
    onSuccess: (acceptedInvitation: Invitation) =>
    {
      // Remove from pending invitations
      setPendingInvitations(
        pendingInvitations.filter((inv) => inv.id !== acceptedInvitation.id),
      );
      
      // Invalidate queries to refresh organization list
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.invitations.pending });
      
      toast.success(t('invitations.accept.success'));
    },
    // No onError - errors are displayed declaratively in the component
  });

  /**
   * Mutation to decline an invitation
   */
  const declineInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => invitationApi.declineInvitation(invitationId),
    onSuccess: (declinedInvitation: Invitation) =>
    {
      // Remove from pending invitations
      setPendingInvitations(
        pendingInvitations.filter((inv) => inv.id !== declinedInvitation.id),
      );
      
      // Invalidate queries
      void queryClient.invalidateQueries({ queryKey: queryKeys.invitations.pending });
      
      toast.success(t('invitations.decline.success'));
    },
    // No onError - errors are displayed declaratively in the component
  });

  /**
   * Update pending invitations in store when query succeeds
   */
  useEffect(() =>
  {
    if (invitationsQuery.data)
    {
      setPendingInvitations(invitationsQuery.data);
    }
  }, [invitationsQuery.data, setPendingInvitations]);

  return {
    // State
    pendingInvitations,
    
    // Query
    invitationsQuery,
    isLoading: invitationsQuery.isLoading,
    error: invitationsQuery.error,
    
    // Actions
    acceptInvitation: acceptInvitationMutation.mutate,
    declineInvitation: declineInvitationMutation.mutate,
    
    // Mutation states
    isAccepting: acceptInvitationMutation.isPending,
    isDeclining: declineInvitationMutation.isPending,
    acceptError: acceptInvitationMutation.error,
    declineError: declineInvitationMutation.error,
  };
};
