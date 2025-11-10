import { z } from 'zod';
import { UserPublicSchema } from './user';

// ============================================================================
// Zod Schemas - Single Source of Truth
// ============================================================================
// These schemas validate data received from the backend to ensure type safety
// and catch breaking API changes at runtime. TypeScript types are derived from
// these schemas using z.infer to maintain consistency.

/**
 * Organization role enum - matches backend OrgRole enum
 * Used for user roles within an organization (not to be confused with user roles like ADMIN/USER)
 */
export const OrgRoleSchema = z.enum(['OWNER', 'MANAGER', 'STAFF']);

/**
 * Organization settings schema - validates org settings structure
 */
export const OrgSettingsSchema = z.object({
  defaultCurrency: z.string(),
});

/**
 * Organization public schema - minimal org info (used in lists, invitations)
 * Owner is mandatory - all public org responses include populated owner data
 */
export const OrganizationPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  owner: UserPublicSchema, // Owner is mandatory (always populated by backend)
});

/**
 * Organization full schema - complete org info including settings
 * Note: DTOs do not include createdAt/updatedAt timestamps
 */
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  settings: OrgSettingsSchema,
});

/**
 * Organization membership schema - represents a user's relationship with an org
 * This is what the backend returns from GET /api/orgs
 * Uses OrganizationPublicSchema because the membership endpoint returns public org info
 * Uses UserPublicSchema because we only need public user info (not private fields like isEmailVerified)
 */
export const OrganizationMembershipSchema = z.object({
  user: UserPublicSchema,
  org: OrganizationPublicSchema, // Uses public schema which includes owner
  role: OrgRoleSchema,
});

/**
 * Create organization request schema - for POST /api/orgs
 */
export const CreateOrganizationRequestSchema = z.object({
  name: z.string().min(1).max(100),
  subscriptionId: z.string(),
  settings: OrgSettingsSchema.optional(),
});

/**
 * Update organization request schema - for PUT /api/orgs/:id
 */
export const UpdateOrganizationRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  settings: OrgSettingsSchema.partial().optional(),
});

/**
 * Edit organization form schema - for client-side form validation
 * Used in EditOrganizationDialog component
 */
export const EditOrganizationFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  defaultCurrency: z.string().length(3, 'Currency code must be 3 characters').toUpperCase(),
});

// ============================================================================
// TypeScript Types - Derived from Zod Schemas
// ============================================================================

export type OrgRole = z.infer<typeof OrgRoleSchema>;
export type OrgSettings = z.infer<typeof OrgSettingsSchema>;
export type OrganizationPublic = z.infer<typeof OrganizationPublicSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type OrganizationMembership = z.infer<typeof OrganizationMembershipSchema>;
export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationRequestSchema>;
export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationRequestSchema>;
export type EditOrganizationFormData = z.infer<typeof EditOrganizationFormSchema>;
