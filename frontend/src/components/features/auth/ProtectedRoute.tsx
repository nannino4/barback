import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps
{
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * ProtectedRoute - Protects routes that require authentication
 * 
 * Redirect behavior:
 * - Not authenticated -> redirectTo (default: /auth/login) with redirect parameter
 * - Authenticated -> Render children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth/login',
}) =>
{
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

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
