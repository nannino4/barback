import { z } from 'zod';
import { apiClient } from '@/api/api';
import type { AuthResponse, RegisterData, LoginData } from '@/types/auth';

// ============================================================================
// Response Schemas - API Contract Validation
// ============================================================================
// These schemas validate data received from the backend to ensure type safety
// and catch breaking API changes at runtime.

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
 * Google OAuth auth URL response schema
 */
export const GoogleAuthUrlResponseSchema = z.object({
  authUrl: z.string().url(),
  state: z.string(),
});

// ============================================================================
// API Methods
// ============================================================================

export const authApi = {
  register: (data: RegisterData): Promise<AuthResponse> =>
  {
    return apiClient.request<AuthResponse>('/auth/register/email', {
      method: 'POST',
      body: JSON.stringify(data),
    }, AuthResponseSchema);
  },

  login: (data: LoginData): Promise<AuthResponse> =>
  {
    return apiClient.request<AuthResponse>('/auth/login/email', {
      method: 'POST',
      body: JSON.stringify(data),
    }, AuthResponseSchema);
  },

  refreshToken: (): Promise<AuthResponse> =>
  {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiClient.request<AuthResponse>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, AuthResponseSchema);
  },

  verifyEmailByUrl: (token: string): Promise<void> =>
  {
    return apiClient.request<void>(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  },

  sendVerificationEmail: (): Promise<void> =>
  {
    return apiClient.request<void>('/auth/send-verification-email', {
      method: 'POST',
    });
  },

  forgotPassword: (email: string): Promise<void> =>
  {
    return apiClient.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: (token: string, password: string): Promise<void> =>
  {
    return apiClient.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: password }),
    });
  },

  // Validate reset token before showing form
  validateResetToken: (token: string): Promise<void> =>
  {
    return apiClient.request<void>(`/auth/reset-password/${token}`, {
      method: 'GET',
    });
  },

  // Google OAuth APIs
  getGoogleAuthUrl: (): Promise<{ authUrl: string; state: string }> =>
  {
    return apiClient.request<{ authUrl: string; state: string }>('/auth/oauth/google', {
      method: 'GET',
    }, GoogleAuthUrlResponseSchema);
  },

  handleGoogleCallback: (code: string, state?: string): Promise<AuthResponse> =>
  {
    return apiClient.request<AuthResponse>('/auth/oauth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, ...(state && { state }) }),
    }, AuthResponseSchema);
  },
};
