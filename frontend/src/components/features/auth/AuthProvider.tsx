import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/api';
import { TokenRefreshService } from '@/lib/token-refresh-service';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/hooks/useI18n';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

interface AuthProviderProps
{
  children: React.ReactNode;
}

/**
 * AuthProvider - Handles global authentication concerns
 * 
 * Responsibilities:
 * - Initialize and manage proactive token refresh service
 * - Set up session expiration callback for API client
 * - Handle automatic redirects when session expires
 * - Preserve current URL for post-login redirect
 * - Show user-friendly messages on session expiration
 * 
 * Should wrap the entire app at the root level.
 * 
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) =>
{
  const navigate = useNavigate();
  const { t } = useI18n();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() =>
  {
    // Get token refresh service instance
    const tokenRefreshService = TokenRefreshService.getInstance(API_BASE_URL);

    // Define session expired handler (called when refresh fails)
    const handleSessionExpired = () =>
    {
      // Clear user from auth store
      logout();

      // Preserve current URL for redirect after re-login
      const currentPath = window.location.pathname + window.location.search;
      const shouldRedirect = currentPath !== '/auth/login' && 
                            !currentPath.startsWith('/auth/');

      // Show user-friendly message
      toast.error(t('auth.errors.sessionExpired'));

      // Redirect to login with return URL
      if (shouldRedirect)
      {
        void navigate(`/auth/login?redirect=${encodeURIComponent(currentPath)}`, {
          replace: true,
        });
      }
      else
      {
        void navigate('/auth/login', { replace: true });
      }
    };

    // Set handler on both services (defense in depth)
    // - Token Refresh Service: Calls handler when proactive refresh fails (invalid refresh token)
    // - API Client: Calls handler when a 401 occurs (fallback for edge cases like manual token removal)
    // 
    // IMPORTANT: Both handlers can fire simultaneously (e.g., if refresh token expires AND
    // a concurrent API call returns 401). This is acceptable - the handler is idempotent
    // (logout clears tokens, navigate replaces state). Future enhancement could add
    // deduplication via a flag if needed.
    tokenRefreshService.setSessionExpiredHandler(handleSessionExpired);
    apiClient.setSessionExpiredHandler(handleSessionExpired);

    // Start proactive token refresh monitoring
    tokenRefreshService.start();

    // Cleanup on unmount
    return () =>
    {
      tokenRefreshService.stop();
    };
  }, [navigate, t, logout]);

  return <>{children}</>;
};
