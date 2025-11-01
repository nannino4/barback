import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ErrorBoundaryWithI18n } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/components/features/auth/AuthProvider'
import { AppLayout } from '@/components/layout/AppLayout'
import { VerifiedRoute } from '@/components/features/auth/VerifiedRoute'
import { AuthRouter } from '@/components/features/auth/AuthRouter'
import { HomePage } from '@/pages/HomePage'
import { LandingPage } from '@/pages/LandingPage'
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
          
          {/* Design System Showcase */}
          <Route path="/design-system" element={<DesignSystemPage />} />
          
          {/* Protected Dashboard - Requires authentication AND email verification */}
          <Route
            path="/dashboard"
            element={
              <VerifiedRoute>
                <HomePage />
              </VerifiedRoute>
            }
          />
          
          {/* Auth routes */}
          <Route path="/auth/*" element={<AuthRouter />} />

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
    <ErrorBoundaryWithI18n>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundaryWithI18n>
  )
}

export default App
