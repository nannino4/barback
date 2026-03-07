import { z } from 'zod';

// ============================================================================
// Zod Schemas - Single Source of Truth
// ============================================================================
// These schemas validate data received from the backend to ensure type safety
// and catch breaking API changes at runtime. TypeScript types are derived from
// these schemas using z.infer to maintain consistency.

/**
 * User schema - validates user object structure from API
 * Full user information including private fields
 */
export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
  isEmailVerified: z.boolean(),
  timezone: z.string().min(1),
  language: z.enum(['en', 'it']),
});

/**
 * User public schema - minimal subset of user info
 * Used for public displays (inviter info, member lists, etc.)
 * Corresponds to OutUserPublicDto on the backend
 */
export const UserPublicResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  profilePictureUrl: z.string().url().optional(),
});

// ============================================================================
// TypeScript Types - Derived from Zod Schemas
// ============================================================================

export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserPublicResponse = z.infer<typeof UserPublicResponseSchema>;
