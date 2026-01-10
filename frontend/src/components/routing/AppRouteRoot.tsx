import { Outlet, ScrollRestoration } from 'react-router-dom';

import { AuthProvider } from '@/components/features/auth/AuthProvider';
import { AppToaster } from '@/components/feedback/AppToaster';
import { AppLayout } from '@/components/layout/AppLayout';

/**
 * AppRouteRoot
 *
 * Root layout route for the Data Router.
 * - Provides auth side effects (token refresh, session expiry redirects)
 * - Provides app chrome (TopNav/BottomNav)
 * - Enables native React Router scroll restoration
 */
export function AppRouteRoot()
{
  return (
    <AuthProvider>
      <ScrollRestoration />
      <AppLayout>
        <Outlet />
      </AppLayout>

      <AppToaster />
    </AuthProvider>
  );
}
