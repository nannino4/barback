import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiClient } from '@/api/api';
import { TokenRefreshService } from '@/lib/token-refresh-service';
import { notify } from '@/lib/notify';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/hooks/useI18n';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string);

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
  const sessionExpiredRef = useRef(false);
  const tRef = useRef(t);
  const navigateRef = useRef(navigate);
  const logoutRef = useRef(logout);

  useEffect(() =>
  {
    tRef.current = t;
  }, [t]);

  useEffect(() =>
  {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() =>
  {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() =>
  {
    // Get token refresh service instance
    const tokenRefreshService = TokenRefreshService.getInstance(API_BASE_URL);

    // Define session expired handler (called when refresh fails)
    const handleSessionExpired = () =>
    {
      // Debounce: prevent double-triggering from multiple sources
      if (sessionExpiredRef.current) return;
      sessionExpiredRef.current = true;

      // Clear user from auth store
      logoutRef.current();

      // Preserve current URL for redirect after re-login
      const currentPath = window.location.pathname + window.location.search;
      const shouldRedirect = currentPath !== '/auth/login' && 
                            !currentPath.startsWith('/auth/');

      // Show user-friendly message
      notify.error(tRef.current('auth.errors.sessionExpired'));

      // Redirect to login with return URL
      if (shouldRedirect)
      {
        void navigateRef.current(`/auth/login?redirect=${encodeURIComponent(currentPath)}`, {
          replace: true,
        });
      }
      else
      {
        void navigateRef.current('/auth/login', { replace: true });
      }

      // Reset debounce flag after navigation completes
      setTimeout(() =>
      {
        sessionExpiredRef.current = false;
      }, 1000);
    };

    // Set handler on both services
    // - Token Refresh Service: Calls handler when proactive refresh fails (invalid refresh token)
    // - API Client: Calls handler when a 401 occurs (fallback for edge cases)
    // The debounce flag prevents duplicate toasts and navigation conflicts
    tokenRefreshService.setSessionExpiredHandler(handleSessionExpired);
    apiClient.setSessionExpiredHandler(handleSessionExpired);

    // Start proactive token refresh monitoring
    tokenRefreshService.start();

    // Cleanup on unmount
    return () =>
    {
      tokenRefreshService.stop();
    };
  }, []);


  return <>{children}</>;
};
