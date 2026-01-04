import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GlobalErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/components/features/auth/AuthProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { VerifiedRoute } from '@/components/features/auth/VerifiedRoute'
import { HasCurrentOrgRoute } from '@/components/features/organizations/HasCurrentOrgRoute'
import { AuthRouter } from '@/components/features/auth/AuthRouter'
import { Dashboard } from '@/pages/Dashboard'
import { InventoryPage } from '@/pages/inventory/InventoryPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { LandingPage } from '@/pages/LandingPage'
import { OrganizationsPage } from '@/pages/org/OrganizationsPage'
import { CreateOrganizationPage } from '@/pages/org/CreateOrganizationPage'
import { OrganizationManagePage } from '@/pages/org/OrganizationManagePage'
import { UserProfilePage } from '@/pages/user/UserProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import DesignSystemPage from '@/pages/DesignSystemPage'
import { ApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
      {
        // Don't retry on 4xx errors (client errors)
        if (ApiError.isApiError(error) && error.statusCode >= 400 && error.statusCode < 500)
        {
          return false;
        }
        // Retry up to 2 times for 5xx or network errors
        return failureCount < 2;
      },
    },
    mutations: {
      // Retry transient errors for mutations too
      retry: (failureCount, error) =>
      {
        // Don't retry on 4xx errors (client errors like validation)
        if (ApiError.isApiError(error) && error.statusCode >= 400 && error.statusCode < 500)
        {
          return false;
        }
        // Retry up to 1 time for 5xx or network errors (fewer than queries)
        // Mutations are more sensitive, so we retry less aggressively
        return failureCount < 1;
      },
      // Global mutation error handler
      onError: (error) =>
      {
        if (ApiError.isApiError(error))
        {
          // 401 errors are handled by api client (token refresh)
          if (error.statusCode === 401) return;
          
          // Log other errors for monitoring
          logger.error('Mutation error:', error);
        }
      },
    },
  },
})

function AppContent()
{
  return (
    <>
      <Routes>
        {/* AppLayout wraps ALL routes with consistent Navigation */}
        <Route element={<AppLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth routes */}
          <Route path="/auth/*" element={<AuthRouter />} />
          
          {/* Design System Showcase */}
          <Route path="/design-system" element={<DesignSystemPage />} />
          
          {/* Requires authentication AND email verification */}
          <Route element={<VerifiedRoute />}>

            { /* Organization management */ }
            <Route path="/orgs" element={<OrganizationsPage />} />
            <Route path="/orgs/create" element={<CreateOrganizationPage />} />
            <Route path="/orgs/:orgId" element={<OrganizationManagePage />} />

            { /* User Profile */ }
            <Route path="/account" element={<UserProfilePage />} />
          </Route>
          
          
          {/* Protected Routes - Requires authentication, email verification, AND organization selection */}
          <Route element={<VerifiedRoute />}>
            <Route element={<HasCurrentOrgRoute />}>

              { /* Bottom Navigation */ }
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>
          </Route>

          {/* 404 Not Found - Catch-all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
            
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-card border border-border text-card-foreground font-body',
          duration: 4000,
        }}
      />
    </>
  );
}

function App()
{
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}

export default App
