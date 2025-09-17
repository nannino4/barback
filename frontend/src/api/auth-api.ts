import { apiClient } from '@/api/api';
import type { AuthResponse, RegisterData, LoginData } from '@/types/auth';

export const authApi = {
  register: (data: RegisterData): Promise<AuthResponse> =>
  {
    return apiClient.request<AuthResponse>('/auth/register/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: (data: LoginData): Promise<AuthResponse> =>
  {
    return apiClient.request<AuthResponse>('/auth/login/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  refreshToken: (): Promise<AuthResponse> =>
  {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiClient.request<AuthResponse>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  verifyEmail: (token: string): Promise<void> =>
  {
    return apiClient.request<void>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  verifyEmailByUrl: (token: string): Promise<void> =>
  {
    return apiClient.request<void>(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  },

  resendVerificationEmail: (email: string): Promise<void> =>
  {
    return apiClient.request<void>('/auth/send-verification-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
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
    });
  },

  handleGoogleCallback: (code: string, state?: string): Promise<AuthResponse> =>
  {
    return apiClient.request<AuthResponse>('/auth/oauth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ code, ...(state && { state }) }),
    });
  },
};
