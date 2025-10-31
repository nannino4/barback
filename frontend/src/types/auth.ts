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
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
  isEmailVerified: z.boolean(),
});

/**
 * Auth response schema - validates login/register/refresh token responses
 */
export const AuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: UserSchema,
});

/**
 * Refresh token response schema - validates token refresh responses
 * (No user object, just new tokens)
 */
export const RefreshTokenResponseSchema = z.object({
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

export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type GoogleAuthUrlResponse = z.infer<typeof GoogleAuthUrlResponseSchema>;

// ============================================================================
// Form Data Types - Not from API
// ============================================================================

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
}

export interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    email: string;
    password: string;
}