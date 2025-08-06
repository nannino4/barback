import { apiClient } from '@/lib/api';
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
