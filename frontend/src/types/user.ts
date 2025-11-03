import { z } from 'zod';

// ============================================================================
// Zod Schemas - Single Source of Truth
// ============================================================================
// These schemas validate data received from the backend to ensure type safety
// and catch breaking API changes at runtime. TypeScript types are derived from
// these schemas using z.infer to maintain consistency.

/**
 * User schema - validates user object structure from API
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
  isEmailVerified: z.boolean(),
});

// ============================================================================
// TypeScript Types - Derived from Zod Schemas
// ============================================================================

export type User = z.infer<typeof UserSchema>;
