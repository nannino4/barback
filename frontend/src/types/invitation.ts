import { z } from 'zod';
import { OrgRoleSchema, OrganizationPublicSchema } from './organization';
import { UserPublicSchema } from './user';

// ============================================================================
// Zod Schemas - Single Source of Truth
// ============================================================================
// These schemas validate data received from the backend to ensure type safety
// and catch breaking API changes at runtime. TypeScript types are derived from
// these schemas using z.infer to maintain consistency.

/**
 * Invitation status enum - matches backend InvitationStatus enum
 */
export const InvitationStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'REVOKED',
  'EXPIRED',
]);

/**
 * Invitation schema - represents an organization invitation
 * This is the ONLY invitation schema - all endpoints return populated invitations
 * 
 * The backend always returns fully populated objects with nested user and org info,
 * never unpopulated ObjectId strings. This aligns with OutInvitationDto on the backend.
 */
export const InvitationSchema = z.object({
  id: z.string(),
  invitedEmail: z.string().email(),
  role: OrgRoleSchema,
  status: InvitationStatusSchema,
  invitedBy: UserPublicSchema, // Populated user object (OutUserPublicDto)
  organization: OrganizationPublicSchema, // Populated org object (OutOrgPublicDto)
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});

/**
 * Create invitation request schema - for POST /api/orgs/:orgId/invitations
 */
export const CreateInvitationRequestSchema = z.object({
  invitedEmail: z.string().email(),
  role: OrgRoleSchema.exclude(['OWNER']), // Cannot invite as OWNER
});

// ============================================================================
// TypeScript Types - Derived from Zod Schemas
// ============================================================================

export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;
export type CreateInvitationRequest = z.infer<typeof CreateInvitationRequestSchema>;
