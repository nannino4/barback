import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';

interface ProtectedRouteProps
{
    children: React.ReactNode;
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth/login',
}) =>
{
  const { isAuthenticated, isLoading } = useAuth();
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
  if (!isAuthenticated)
  {
    // Encode current path as redirect parameter
    const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(location.pathname)}`;
    return (
      <Navigate
        to={redirectUrl}
        replace
      />
    );
  }

  // Render protected content
  return <>{children}</>;
};
