import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/components/features/auth/AuthProvider';
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

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-card border border-border text-card-foreground font-body',
          duration: 4000,
        }}
      />
    </AuthProvider>
  );
}
