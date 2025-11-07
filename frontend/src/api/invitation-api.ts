import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  InvitationSchema,
  type Invitation,
} from '@/types/invitation';

// ============================================================================
// API Methods
// ============================================================================

export const invitationApi = {
  /**
   * Get all pending invitations for the current user
   * Returns populated data with organization and inviter details
   * @returns List of pending invitations with populated fields
   */
  getPendingInvitations: (): Promise<Invitation[]> =>
  {
    return apiClient.request<Invitation[]>(
      '/invites',
      {
        method: 'GET',
      },
      z.array(InvitationSchema),
    );
  },

  /**
   * Accept an invitation
   * @param invitationId The invitation ID to accept
   * @returns The updated invitation
   */
  acceptInvitation: (invitationId: string): Promise<Invitation> =>
  {
    return apiClient.request<Invitation>(
      `/invites/${invitationId}/accept`,
      {
        method: 'POST',
      },
      InvitationSchema,
    );
  },

  /**
   * Decline an invitation
   * @param invitationId The invitation ID to decline
   * @returns The updated invitation
   */
  declineInvitation: (invitationId: string): Promise<Invitation> =>
  {
    return apiClient.request<Invitation>(
      `/invites/${invitationId}/decline`,
      {
        method: 'POST',
      },
      InvitationSchema,
    );
  },
};
