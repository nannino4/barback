import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';

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

  // Show loading state while checking authentication
  if (isLoading)
  {
    return (
      <div className="min-h-screen bg-background">
        <Spinner 
          size="lg" 
          text="Loading..."
          className="min-h-screen"
        />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated)
  {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Render protected content
  return <>{children}</>;
};
