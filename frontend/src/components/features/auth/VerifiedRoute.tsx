import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface VerifiedRouteProps
{
  children?: React.ReactNode;
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
 * - Authenticated but not verified -> /auth/send-verification-email
 * - Authenticated and verified -> Render children (legacy) or Outlet (nested routes)
 * 
 * Usage:
 * ```tsx
 * // Legacy pattern (with children)
 * <Route path="/users/me" element={<VerifiedRoute><UserProfilePage /></VerifiedRoute>} />
 * 
 * // New pattern (with nested routes)
 * <Route element={<VerifiedRoute />}>
 *   <Route path="/organizations" element={<OrganizationsPage />} />
 *   <Route path="/invitations" element={<MyInvitationsPage />} />
 * </Route>
 * ```
 */
export const VerifiedRoute: React.FC<VerifiedRouteProps> = ({ children }) =>
{
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated)
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

  // At this point user must exist due to store logic
  // Redirect to email verification if authenticated but not verified
  if (!user!.isEmailVerified)
  {
    return (
      <Navigate
        to="/auth/send-verification-email"
        replace
      />
    );
  }

  // User is authenticated and verified
  // Support both legacy pattern (children) and new pattern (Outlet)
  return children ? <>{children}</> : <Outlet />;
};
