import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/ThemeProvider'
import { GlobalErrorBoundary } from '@/components/ErrorBoundary'
import { AppRouteRoot } from '@/components/routing/AppRouteRoot'
import { VerifiedRoute } from '@/components/features/auth/VerifiedRoute'
import { HasCurrentOrgRoute } from '@/components/features/organizations/HasCurrentOrgRoute'
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute'
import { InventoryPage } from '@/pages/inventory/InventoryPage'
import { AlertsPage } from '@/pages/AlertsPage'
import { MorePage } from '@/pages/MorePage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { SendVerificationEmailPage } from '@/pages/auth/SendVerificationEmailPage'
import { VerifyEmailCallbackPage } from '@/pages/auth/VerifyEmailCallbackPage'
import { GoogleCallbackPage } from '@/pages/auth/GoogleCallbackPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ForgotPasswordSentPage } from '@/pages/auth/ForgotPasswordSentPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { OrganizationsPage } from '@/pages/org/OrganizationsPage'
import { CreateOrganizationPage } from '@/pages/org/CreateOrganizationPage'
import { OrganizationManagePage } from '@/pages/org/OrganizationManagePage'
import { UserProfilePage } from '@/pages/user/UserProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import DesignSystemPage from '@/pages/DesignSystemPage'
import { ApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { ROUTES } from '@/constants/routes'

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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppRouteRoot />}>
      {/* Public Routes */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />

      {/* Auth routes */}
      <Route
        path={ROUTES.AUTH.REGISTER}
        element={<RegisterPage />}
      />
      <Route
        path={ROUTES.AUTH.LOGIN}
        element={<LoginPage />}
      />

      <Route
        path={ROUTES.AUTH.SEND_VERIFICATION_EMAIL}
        element={
          <ProtectedRoute>
            <SendVerificationEmailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.VERIFY_EMAIL}
        element={<VerifyEmailCallbackPage />}
      />

      <Route
        path={ROUTES.AUTH.FORGOT_PASSWORD}
        element={<ForgotPasswordPage />}
      />
      <Route
        path={ROUTES.AUTH.FORGOT_PASSWORD_SENT}
        element={<ForgotPasswordSentPage />}
      />
      <Route
        path={ROUTES.AUTH.RESET_PASSWORD}
        element={<ResetPasswordPage />}
      />

      <Route
        path={ROUTES.AUTH.GOOGLE_CALLBACK}
        element={<GoogleCallbackPage />}
      />

      {/* Design System Showcase */}
      <Route path={ROUTES.DESIGN_SYSTEM} element={<DesignSystemPage />} />

      {/* Requires authentication AND email verification */}
      <Route element={<VerifiedRoute />}>
        {/* Organization management */}
        <Route path={ROUTES.ORGS.ROOT} element={<OrganizationsPage />} />
        <Route path={ROUTES.ORGS.CREATE} element={<CreateOrganizationPage />} />
        <Route path={ROUTES.ORGS.DETAIL} element={<OrganizationManagePage />} />

        {/* User Profile */}
        <Route path={ROUTES.USERS.ME} element={<UserProfilePage />} />

        {/* Requires organization selection */}
        <Route element={<HasCurrentOrgRoute />}>
          {/* Inventory is the default landing page (Sprint 4.5) */}
          <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
          <Route path={ROUTES.ALERTS} element={<AlertsPage />} />
          <Route path={ROUTES.MORE} element={<MorePage />} />
        </Route>
      </Route>

      {/* 404 Not Found - Catch-all route */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Route>,
  ),
);

function App()
{
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}

export default App
