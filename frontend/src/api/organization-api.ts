import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  OrganizationMembershipSchema,
  OrganizationSchema,
  type OrganizationMembership,
  type Organization,
  type CreateOrganizationRequest,
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
   * Create a new organization
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
};
