import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/hooks/useI18n';

interface VerifiedRouteProps
{
    children: React.ReactNode;
}

/**
 * VerifiedRoute - Protects routes that require both authentication AND email verification
 * 
 * This component enforces a two-tier security model:
 * 1. User must be authenticated (logged in)
 * 2. User must have verified their email address
 * 
 * Redirect behavior:
 * - Not authenticated -> /auth/login with redirect parameter
 * - Authenticated but not verified -> /auth/verify-email
 * - Authenticated and verified -> Render children
 * 
 */
export const VerifiedRoute: React.FC<VerifiedRouteProps> = ({ children }) =>
{
  const { isAuthenticated, isLoading } = useAuth();
  const { user } = useAuthStore();
  const location = useLocation();
  const { t } = useI18n();

  // Show loading state while checking authentication
  if (isLoading)
  {
    return (
      <div className="min-h-screen bg-background">
        <Spinner 
          size="lg" 
          text={t('common.loading')}
          className="min-h-screen"
        />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user)
  {
    // Encode current path as redirect parameter
    const redirectUrl = `/auth/login?redirect=${encodeURIComponent(location.pathname)}`;
    return (
      <Navigate
        to={redirectUrl}
        replace
      />
    );
  }

  // Redirect to email verification if authenticated but not verified
  if (!user.isEmailVerified)
  {
    return (
      <Navigate
        to="/auth/send-verification-email"
        replace
      />
    );
  }

  // User is authenticated and verified - render protected content
  return <>{children}</>;
};
