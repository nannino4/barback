import { apiClient } from '@/api/api';
import {
  AuthResponseSchema,
  GoogleAuthUrlResponseSchema,
  type AuthResponse,
  type GoogleAuthUrlResponse,
} from '@/types/auth';
import type { RegisterData, LoginData } from '@/types/auth-forms';

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

  handleGoogleCallback: (code: string, state: string): Promise<AuthResponse> =>
  {
    return apiClient.request<AuthResponse>('/auth/oauth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    }, AuthResponseSchema);
  },
};
