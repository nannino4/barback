import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { logger } from '@/lib/logger';
import { 
  ApiError, 
  NetworkError, 
  ValidationError, 
  getLocalizedErrorMessage,
  isKnownError,
} from '@/lib/errors';

/**
 * Error Fallback Component - Shows when an error is caught
 * 
 * Uses hooks directly thanks to react-error-boundary
 * Detects error types and shows contextual messages
 */
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps)
{
  const { t } = useI18n();

  // Determine title based on error type
  let title = t('errors.boundary.title');
  if (ApiError.isApiError(error))
  {
    title = t('errors.boundary.apiErrorTitle');
  }
  else if (NetworkError.isNetworkError(error))
  {
    title = t('errors.boundary.networkErrorTitle');
  }
  else if (ValidationError.isValidationError(error))
  {
    title = t('errors.boundary.validationErrorTitle');
  }

  // Get localized message (handles all known error types)
  const message = isKnownError(error)
    ? getLocalizedErrorMessage(error, t)
    : t('errors.boundary.message');

  const handleReload = () =>
  {
    // Full page reload as last resort
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {message}
          </p>

          {/* Show error details in development */}
          {import.meta.env.DEV && (
            <details className="p-3 bg-muted rounded-md text-sm">
              <summary className="cursor-pointer font-medium text-destructive">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 overflow-auto text-xs max-h-64 p-2 bg-background rounded">
                {String(error)}
                {'\n\n'}
                {error instanceof Error ? error.stack : ''}
              </pre>
            </details>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={resetErrorBoundary}
              variant="outline"
              className="flex-1"
            >
              {t('errors.boundary.tryAgain')}
            </Button>
            <Button
              onClick={handleReload}
              className="flex-1"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {t('errors.boundary.reloadPage')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            {t('errors.boundary.footer')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Global Error Boundary with i18n support
 * 
 * Wraps the entire app to catch unhandled React errors.
 * Uses react-error-boundary for modern hook support.
 * 
 * CURRENT USAGE:
 * Single root boundary for the entire app. All routes share this boundary.
 * 
 * FUTURE USAGE - When to add additional error boundaries:
 * 
 * 1. **Feature-specific boundaries** (recommended for production apps):
 *    - Wrap major feature sections (inventory, orders, reports)
 *    - Allows one feature to fail without crashing the entire app
 *    - Example: <InventoryErrorBoundary><InventoryPage /></InventoryErrorBoundary>
 * 
 * 2. **Complex component boundaries**:
 *    - Wrap third-party components that might throw errors
 *    - Wrap heavy data visualizations or charts
 *    - Example: <ChartErrorBoundary><ComplexChart /></ChartErrorBoundary>
 * 
 * 3. **Modal/Dialog boundaries**:
 *    - Wrap modal content to prevent modal errors from crashing the app
 *    - Example: <DialogErrorBoundary><ProductFormDialog /></DialogErrorBoundary>
 * 
 * WHEN NOT TO USE:
 * - Don't wrap individual buttons, inputs, or simple components
 * - Don't nest too many boundaries (adds complexity)
 * - For simple apps with few features, a single root boundary is sufficient
 * 
 * BEST PRACTICES:
 * - Error boundaries only catch **render errors**, not async errors
 * - Use try-catch or .catch() for async operations (API calls, promises)
 * - Use TanStack Query's built-in error handling for data fetching
 * - Show toast messages for user-facing errors (validation, network)
 * - Use error boundaries for unexpected errors (bugs, crashes)
 * 
 * Usage:
 * ```tsx
 * // Current: Single root boundary
 * <GlobalErrorBoundary>
 *   <App />
 * </GlobalErrorBoundary>
 * 
 * // Future: Feature-specific boundaries
 * <GlobalErrorBoundary>
 *   <Routes>
 *     <Route path="/inventory" element={
 *       <InventoryErrorBoundary>
 *         <InventoryPage />
 *       </InventoryErrorBoundary>
 *     } />
 *   </Routes>
 * </GlobalErrorBoundary>
 * ```
 */
export const GlobalErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
  const [resetKey, setResetKey] = React.useState(0);
  
  const onError = (error: Error, errorInfo: React.ErrorInfo) =>
  {
    // Only log full details in development to avoid memory issues
    if (import.meta.env.DEV)
    {
      logger.error('Error caught by ErrorBoundary:', { error, errorInfo });
    }
    
    // TODO: Log to error tracking service in production (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return (
    <ReactErrorBoundary
      resetKeys={[resetKey]}
      FallbackComponent={ErrorFallback}
      onError={onError}
      onReset={() =>
      {
        // Increment reset key to force full remount and clear stale state
        setResetKey((prev) => prev + 1);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
