import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  InvitationResponseSchema,
  type InvitationResponse,
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
  getPendingInvitations: (): Promise<InvitationResponse[]> =>
  {
    return apiClient.request<InvitationResponse[]>(
      '/invites',
      {
        method: 'GET',
      },
      z.array(InvitationResponseSchema),
    );
  },

  /**
   * Accept an invitation
   * @param invitationId The invitation ID to accept
   * @returns The updated invitation
   */
  acceptInvitation: (invitationId: string): Promise<InvitationResponse> =>
  {
    return apiClient.request<InvitationResponse>(
      `/invites/${invitationId}/accept`,
      {
        method: 'POST',
      },
      InvitationResponseSchema,
    );
  },

  /**
   * Decline an invitation
   * @param invitationId The invitation ID to decline
   * @returns The updated invitation
   */
  declineInvitation: (invitationId: string): Promise<InvitationResponse> =>
  {
    return apiClient.request<InvitationResponse>(
      `/invites/${invitationId}/decline`,
      {
        method: 'POST',
      },
      InvitationResponseSchema,
    );
  },

  /**
   * Get pending invitations for an organization (owner/manager)
   * @param orgId Organization ID
   * @returns List of pending invitations
   */
  getOrganizationInvitations: (orgId: string): Promise<InvitationResponse[]> =>
  {
    return apiClient.request<InvitationResponse[]>(
      `/orgs/${orgId}/invitations`,
      {
        method: 'GET',
      },
      z.array(InvitationResponseSchema),
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
  ): Promise<InvitationResponse> =>
  {
    return apiClient.request<InvitationResponse>(
      `/orgs/${orgId}/invitations`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      InvitationResponseSchema,
    );
  },

  /**
   * Revoke pending invitation (owner/manager)
   * @param orgId Organization ID
   * @param invitationId Invitation ID
   * @returns Updated invitation
   */
  revokeInvitation: (orgId: string, invitationId: string): Promise<InvitationResponse> =>
  {
    return apiClient.request<InvitationResponse>(
      `/orgs/${orgId}/invitations/${invitationId}`,
      {
        method: 'DELETE',
      },
      InvitationResponseSchema,
    );
  },
};
