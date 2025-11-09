import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  InvitationSchema,
  type Invitation,
  type CreateInvitationRequest,
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

  /**
   * Get pending invitations for an organization (owner/manager)
   * @param orgId Organization ID
   * @returns List of pending invitations
   */
  getOrganizationInvitations: (orgId: string): Promise<Invitation[]> =>
  {
    return apiClient.request<Invitation[]>(
      `/orgs/${orgId}/invitations`,
      {
        method: 'GET',
      },
      z.array(InvitationSchema),
    );
  },

  /**
   * Send invitation to join organization (owner/manager)
   * @param orgId Organization ID
   * @param data Invitation data (email, role)
   * @returns Created invitation
   */
  sendInvitation: (
    orgId: string,
    data: CreateInvitationRequest,
  ): Promise<Invitation> =>
  {
    return apiClient.request<Invitation>(
      `/orgs/${orgId}/invitations`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      InvitationSchema,
    );
  },

  /**
   * Revoke pending invitation (owner/manager)
   * @param orgId Organization ID
   * @param invitationId Invitation ID
   * @returns Updated invitation
   */
  revokeInvitation: (orgId: string, invitationId: string): Promise<Invitation> =>
  {
    return apiClient.request<Invitation>(
      `/orgs/${orgId}/invitations/${invitationId}`,
      {
        method: 'DELETE',
      },
      InvitationSchema,
    );
  },
};
