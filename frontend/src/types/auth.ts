import { z } from 'zod';
import { UserResponseSchema } from './user';

// ============================================================================
// Zod Schemas - Single Source of Truth
// ============================================================================
// These schemas validate data received from the backend to ensure type safety
// and catch breaking API changes at runtime. TypeScript types are derived from
// these schemas using z.infer to maintain consistency.

/**
 * Auth response schema - validates login/register/refresh token responses
 */
export const AuthTokensResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: UserResponseSchema,
});

/**
 * Refresh token response schema - validates token refresh responses
 * (No user object, just new tokens)
 */
export const RefreshTokensResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

/**
 * Google OAuth auth URL response schema
 */
export const GoogleAuthUrlResponseSchema = z.object({
  authUrl: z.string().url(),
  state: z.string(),
});

// ============================================================================
// TypeScript Types - Derived from Zod Schemas
// ============================================================================

export type AuthTokensResponse = z.infer<typeof AuthTokensResponseSchema>;
export type RefreshTokensResponse = z.infer<typeof RefreshTokensResponseSchema>;
export type GoogleAuthUrlResponse = z.infer<typeof GoogleAuthUrlResponseSchema>;