import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { 
  ApiError, 
  NetworkError, 
  ValidationError, 
  getLocalizedErrorMessage,
  isKnownError,
} from '@/lib/errors';

/**
 * Route-specific Error Fallback Component
 * Shows a more contextual error with navigation options
 * Detects error types and shows contextual messages
 */
function RouteErrorFallback({ error, resetErrorBoundary }: FallbackProps)
{
  const { t } = useI18n();
  const navigate = useNavigate();

  // Determine title based on error type
  let title = t('errors.routeError.title');
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
    : t('errors.routeError.message');

  const handleBackHome = () =>
  {
    void navigate('/', { replace: true });
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
              {t('errors.routeError.tryAgain')}
            </Button>
            <Button
              onClick={handleBackHome}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('errors.routeError.backHome')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            {t('errors.routeError.footer')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * RouteErrorBoundary - Section-specific error boundary
 * 
 * Provides per-route error isolation so errors in one section
 * don't crash the entire app. Users can navigate away from broken sections.
 * 
 * Features:
 * - Route-specific error message
 * - Navigation back to home
 * - Try again without full reload
 * 
 * Usage:
 * ```tsx
 * <RouteErrorBoundary>
 *   <AuthRouter />
 * </RouteErrorBoundary>
 * ```
 */
export const RouteErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
  const [resetKey, setResetKey] = React.useState(0);
  
  const onError = (error: Error, errorInfo: React.ErrorInfo) =>
  {
    // Only log full details in development to avoid memory issues
    if (import.meta.env.DEV)
    {
      console.error('Route error caught by ErrorBoundary:', error, errorInfo);
    }
    
    // TODO: Log to error tracking service in production
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return (
    <ReactErrorBoundary
      resetKeys={[resetKey]}
      FallbackComponent={RouteErrorFallback}
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
