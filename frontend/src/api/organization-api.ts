import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  OrganizationMembershipResponseSchema,
  OrganizationResponseSchema,
  type OrganizationMembershipResponse,
  type OrganizationResponse,
  type CreateOrganizationRequest,
  type UpdateOrganizationRequest,
  type OrgRole,
} from '@/types/organization';
import { SubscriptionResponseSchema, SubscriptionStatusOnlyResponseSchema, type SubscriptionResponse, type SubscriptionStatusOnlyResponse } from '@/types/subscription';

// ============================================================================
// API Methods
// ============================================================================

export const organizationApi = {
  /**
   * Get all organizations the user is a member of
   * @param orgRole Optional filter by user's role in organizations (OWNER, MANAGER, STAFF)
   * @returns List of organization memberships
   */
  getOrganizations: (orgRole?: OrgRole): Promise<OrganizationMembershipResponse[]> =>
  {
    const params = orgRole ? `?orgRole=${orgRole}` : '';
    
    return apiClient.request<OrganizationMembershipResponse[]>(
      `/orgs${params}`,
      {
        method: 'GET',
      },
      z.array(OrganizationMembershipResponseSchema),
    );
  },

  /**
   * Create a new organization with Stripe subscription ID
   * @param data Organization creation data (name, stripeSubscriptionId, optional settings)
   * @returns The created organization
   */
  createOrganization: (
    data: CreateOrganizationRequest,
  ): Promise<OrganizationResponse> =>
  {
    return apiClient.request<OrganizationResponse>(
      '/orgs',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      OrganizationResponseSchema,
    );
  },

  /**
   * Get a specific organization by ID
   * @param orgId Organization ID
   * @returns The organization details
   */
  getOrganizationById: (orgId: string): Promise<OrganizationResponse> =>
  {
    return apiClient.request<OrganizationResponse>(
      `/orgs/${orgId}`,
      {
        method: 'GET',
      },
      OrganizationResponseSchema,
    );
  },

  /**
   * Get organization members
   * @param orgId Organization ID
   * @returns List of organization memberships
   */
  getOrganizationMembers: (orgId: string): Promise<OrganizationMembershipResponse[]> =>
  {
    return apiClient.request<OrganizationMembershipResponse[]>(
      `/orgs/${orgId}/members`,
      {
        method: 'GET',
      },
      z.array(OrganizationMembershipResponseSchema),
    );
  },

  /**
   * Get organization subscription (owner only)
   * @param orgId Organization ID
   * @returns The organization's full subscription details
   */
  getOrganizationSubscription: (orgId: string): Promise<SubscriptionResponse> =>
  {
    return apiClient.request<SubscriptionResponse>(
      `/orgs/${orgId}/subscription`,
      {
        method: 'GET',
      },
      SubscriptionResponseSchema,
    );
  },

  /**
   * Get organization subscription status (all members)
   * @param orgId Organization ID
   * @returns The organization's subscription status
   */
  getOrganizationSubscriptionStatus: (orgId: string): Promise<SubscriptionStatusOnlyResponse> =>
  {
    return apiClient.request<SubscriptionStatusOnlyResponse>(
      `/orgs/${orgId}/subscription/status`,
      {
        method: 'GET',
      },
      SubscriptionStatusOnlyResponseSchema,
    );
  },

  /**
   * Update organization details
   * @param orgId Organization ID
   * @param data Updated organization data
   * @returns Updated organization
   */
  updateOrganization: (
    orgId: string,
    data: UpdateOrganizationRequest,
  ): Promise<OrganizationResponse> =>
  {
    return apiClient.request<OrganizationResponse>(
      `/orgs/${orgId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      OrganizationResponseSchema,
    );
  },

  /**
   * Delete organization (owner only)
   * @param orgId Organization ID
   * @returns void
   */
  deleteOrganization: (orgId: string): Promise<void> =>
  {
    return apiClient.request<void>(
      `/orgs/${orgId}`,
      {
        method: 'DELETE',
      },
      z.void(),
    );
  },

  /**
   * Remove member from organization (owner only)
   * @param orgId Organization ID
   * @param userId User ID to remove
   * @returns void
   */
  removeMember: (orgId: string, userId: string): Promise<void> =>
  {
    return apiClient.request<void>(
      `/orgs/${orgId}/members/${userId}`,
      {
        method: 'DELETE',
      },
      z.void(),
    );
  },

  /**
   * Leave an organization (non-owner members only)
   * @param orgId Organization ID
   * @returns void
   */
  leaveOrganization: (orgId: string): Promise<void> =>
  {
    return apiClient.request<void>(
      `/orgs/${orgId}/leave`,
      {
        method: 'POST',
      },
      z.void(),
    );
  },

  /**
   * Validate organization name availability
   * @param name Organization name to validate
   * @returns Object with available boolean indicating if name is available
   */
  validateOrgName: (name: string): Promise<{ available: boolean }> =>
  {
    return apiClient.request<{ available: boolean }>(
      '/orgs/validate-name',
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      },
      z.object({ available: z.boolean() }),
    );
  },
};
