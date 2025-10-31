import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';
import { AuthTokenManager } from '@/lib/auth-tokens';

/**
 * Auth store state interface
 * Note: Error handling is done via toasts, not store state
 */
interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      login: (user: User, accessToken: string, refreshToken: string) =>
      {
        // Store tokens using AuthTokenManager
        AuthTokenManager.setTokens(accessToken, refreshToken);
                
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () =>
      {
        // Clear tokens using AuthTokenManager
        AuthTokenManager.clearTokens();
                
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);