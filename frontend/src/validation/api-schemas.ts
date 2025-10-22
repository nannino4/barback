import { z } from 'zod';

/**
 * Zod schemas for API response validation
 * These schemas ensure runtime type safety for data received from the backend
 */

// User schema - matches the User interface
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  profilePictureUrl: z.string().url().nullable().optional(),
  isEmailVerified: z.boolean(),
});

// Auth response schema - used for login/register/refresh token responses
export const AuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: UserSchema,
});

// Google OAuth auth URL response
export const GoogleAuthUrlResponseSchema = z.object({
  authUrl: z.string().url(),
  state: z.string(),
});

/**
 * Type helpers - infer TypeScript types from Zod schemas
 * This ensures schemas and types stay in sync
 */
export type UserSchemaType = z.infer<typeof UserSchema>;
export type AuthResponseSchemaType = z.infer<typeof AuthResponseSchema>;
export type GoogleAuthUrlResponseSchemaType = z.infer<typeof GoogleAuthUrlResponseSchema>;
