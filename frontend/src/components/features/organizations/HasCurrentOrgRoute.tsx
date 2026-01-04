import { Link, Outlet } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useOrganizationStore } from '@/stores/organizationStore';
import { PageContainer, Stack } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';

/**
 * HasCurrentOrgRoute - Protects routes that require an organization context
 * 
 * This component enforces that the user has selected a working organization:
 * - If no organization is selected → Display feedback with CTA to organizations page
 * - If organization is selected → Render child routes via Outlet
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
  const { t } = useI18n();

  // Display feedback if no organization is selected
  if (!currentOrg)
  {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Stack space="lg" className="items-center text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <Stack space="sm" className="items-center">
              <h1 className="text-2xl font-semibold">
                {t('organizations.noOrgSelected.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('organizations.noOrgSelected.description')}
              </p>
            </Stack>
            
            <Button
              asChild
              size="lg"
              className="gap-2"
            >
              <Link to="/orgs">
                <Building2 className="w-4 h-4" />
                {t('organizations.noOrgSelected.goToOrganizations')}
              </Link>
            </Button>
          </Stack>
        </div>
      </PageContainer>
    );
  }

  // User has selected an organization - render child routes
  return <Outlet />;
};
