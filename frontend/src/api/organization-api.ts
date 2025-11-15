import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  OrganizationMembershipSchema,
  OrganizationSchema,
  type OrganizationMembership,
  type Organization,
  type CreateOrganizationRequest,
  type CreateOrganizationWithStripeSubscriptionRequest,
  type UpdateOrganizationRequest,
  type OrgRole,
} from '@/types/organization';

// ============================================================================
// API Methods
// ============================================================================

export const organizationApi = {
  /**
   * Get all organizations the user is a member of
   * @param orgRole Optional filter by user's role in organizations (OWNER, MANAGER, STAFF)
   * @returns List of organization memberships
   */
  getOrganizations: (orgRole?: OrgRole): Promise<OrganizationMembership[]> =>
  {
    const params = orgRole ? `?orgRole=${orgRole}` : '';
    
    return apiClient.request<OrganizationMembership[]>(
      `/orgs${params}`,
      {
        method: 'GET',
      },
      z.array(OrganizationMembershipSchema),
    );
  },

  /**
   * Create a new organization with MongoDB subscription ID
   * @param data Organization creation data (name, subscriptionId, optional settings)
   * @returns The created organization
   */
  createOrganization: (data: CreateOrganizationRequest): Promise<Organization> =>
  {
    return apiClient.request<Organization>(
      '/orgs',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      OrganizationSchema,
    );
  },

  /**
   * Create a new organization with Stripe subscription ID
   * Recommended for payment flow integration
   * @param data Organization creation data (name, stripeSubscriptionId, optional settings)
   * @returns The created organization
   */
  createOrganizationWithStripeSubscription: (
    data: CreateOrganizationWithStripeSubscriptionRequest,
  ): Promise<Organization> =>
  {
    return apiClient.request<Organization>(
      '/orgs/with-stripe-subscription',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      OrganizationSchema,
    );
  },

  /**
   * Get a specific organization by ID
   * @param orgId Organization ID
   * @returns The organization details
   */
  getOrganizationById: (orgId: string): Promise<Organization> =>
  {
    return apiClient.request<Organization>(
      `/orgs/${orgId}`,
      {
        method: 'GET',
      },
      OrganizationSchema,
    );
  },

  /**
   * Get organization members
   * @param orgId Organization ID
   * @returns List of organization memberships
   */
  getOrganizationMembers: (orgId: string): Promise<OrganizationMembership[]> =>
  {
    return apiClient.request<OrganizationMembership[]>(
      `/orgs/${orgId}/members`,
      {
        method: 'GET',
      },
      z.array(OrganizationMembershipSchema),
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
  ): Promise<Organization> =>
  {
    return apiClient.request<Organization>(
      `/orgs/${orgId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      OrganizationSchema,
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
