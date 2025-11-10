import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useOrganizationStore } from '@/stores/organizationStore';

/**
 * HasCurrentOrgRoute - Protects routes that require an organization context
 * 
 * This component enforces that the user has selected a working organization:
 * - If no organization is selected → Redirect to /organizations with redirectTo param
 * - If organization is selected → Render child routes via Outlet
 * 
 * Redirect behavior:
 * - Preserves current path as redirect parameter
 * - After org selection, user is redirected back to original destination
 * 
 * Usage:
 * ```tsx
 * <Route element={<HasCurrentOrgRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 *   <Route path="/inventory" element={<InventoryPage />} />
 *   <Route path="/orders" element={<OrdersPage />} />
 * </Route>
 * ```
 */
export const HasCurrentOrgRoute: React.FC = () =>
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

  // User has selected an organization - render child routes
  return <Outlet />;
};
