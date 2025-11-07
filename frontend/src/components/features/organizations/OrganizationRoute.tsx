import { Navigate, useLocation } from 'react-router-dom';
import { useOrganizationStore } from '@/stores/organizationStore';

interface OrganizationRouteProps
{
  children: React.ReactNode;
}

/**
 * OrganizationRoute - Protects routes that require an organization context
 * 
 * This component enforces that the user has selected an organization:
 * - If no organization is selected -> Redirect to /organizations with redirectTo param
 * - If organization is selected -> Render children
 * 
 * Redirect behavior:
 * - Preserves current path as redirect parameter
 * - After org selection, user is redirected back to original destination
 * 
 * Usage:
 * ```tsx
 * <Route
 *   path="/dashboard"
 *   element={
 *     <OrganizationRoute>
 *       <Dashboard />
 *     </OrganizationRoute>
 *   }
 * />
 * ```
 */
export const OrganizationRoute: React.FC<OrganizationRouteProps> = ({ children }) =>
{
  const { currentOrg } = useOrganizationStore();
  const location = useLocation();

  // Redirect to organizations page if no organization is selected
  if (!currentOrg)
  {
    // Encode current path as redirect parameter
    const redirectUrl = `/organizations?redirectTo=${encodeURIComponent(location.pathname + location.search)}`;
    
    return (
      <Navigate
        to={redirectUrl}
        replace
      />
    );
  }

  // User has selected an organization - render protected content
  return <>{children}</>;
};
