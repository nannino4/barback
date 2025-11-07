import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import { AuthTokenManager } from '@/lib/auth-tokens';

/**
 * Auth store state interface
 * Note: Error and loading states are managed by React Query mutations in useAuth hook.
 * This store only manages the authenticated user state and token storage.
 */
interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      login: (user: User, accessToken: string, refreshToken: string) =>
      {
        // Store tokens using AuthTokenManager
        AuthTokenManager.setTokens(accessToken, refreshToken);
                
        set({
          user,
          isAuthenticated: true,
        });
      },

      logout: () =>
      {
        // Clear tokens using AuthTokenManager
        AuthTokenManager.clearTokens();
                
        set({
          user: null,
          isAuthenticated: false,
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