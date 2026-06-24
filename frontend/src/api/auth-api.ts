import { apiClient } from '@/api/api';
import {
  AuthTokensResponseSchema,
  GoogleAuthUrlResponseSchema,
  type AuthTokensResponse,
  type GoogleAuthUrlResponse,
} from '@/types/auth';
import type { RegisterRequest, LoginRequest } from '@/types/auth-forms';

// ============================================================================
// API Methods
// ============================================================================

export const authApi = {
  register: (data: RegisterRequest): Promise<AuthTokensResponse> =>
  {
    return apiClient.request<AuthTokensResponse>('/auth/register/email', {
      method: 'POST',
      body: JSON.stringify(data),
    }, AuthTokensResponseSchema);
  },

  login: (data: LoginRequest): Promise<AuthTokensResponse> =>
  {
    return apiClient.request<AuthTokensResponse>('/auth/login/email', {
      method: 'POST',
      body: JSON.stringify(data),
    }, AuthTokensResponseSchema);
  },

  verifyEmailByUrl: (token: string): Promise<void> =>
  {
    return apiClient.request(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  },

  sendVerificationEmail: (): Promise<void> =>
  {
    return apiClient.request('/auth/send-verification-email', {
      method: 'POST',
    });
  },

  forgotPassword: (email: string): Promise<void> =>
  {
    return apiClient.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: (token: string, password: string): Promise<void> =>
  {
    return apiClient.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: password }),
    });
  },

  // Validate reset token before showing form
  validateResetToken: (token: string): Promise<void> =>
  {
    return apiClient.request(`/auth/reset-password/${token}`, {
      method: 'GET',
    });
  },

  // Google OAuth APIs
  getGoogleAuthUrl: (): Promise<GoogleAuthUrlResponse> =>
  {
    return apiClient.request<GoogleAuthUrlResponse>('/auth/oauth/google', {
      method: 'GET',
    }, GoogleAuthUrlResponseSchema);
  },

  handleGoogleCallback: (code: string, state: string): Promise<AuthTokensResponse> =>
  {
    return apiClient.request<AuthTokensResponse>('/auth/oauth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    }, AuthTokensResponseSchema);
  },
};
