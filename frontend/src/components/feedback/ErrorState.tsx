import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps
{
  /**
   * Error title
   */
  title: string;
  /**
   * Error description
   */
  description?: string;
  /**
   * Retry action
   */
  onRetry?: () => void;
  /**
   * Whether retry action is in progress
   * @default false
   */
  isRetrying?: boolean;
  /**
   * Custom retry button label
   * @default "Try Again"
   */
  retryLabel?: string;
  /**
   * Display as card or inline
   * @default 'card'
   */
  variant?: 'card' | 'inline';
  className?: string;
}

/**
 * ErrorState - Consistent error display with retry option
 * 
 * Usage:
 * ```tsx
 * // As a card (default)
 * <ErrorState
 *   title="Failed to load organizations"
 *   description="We couldn't load your organizations. Please try again."
 *   onRetry={() => refetch()}
 *   isRetrying={isLoading}
 * />
 * 
 * // Inline variant
 * <ErrorState
 *   variant="inline"
 *   title="Something went wrong"
 *   onRetry={() => refetch()}
 * />
 * ```
 * 
 * Features:
 * - Consistent error UI across app
 * - Optional retry functionality
 * - Card or inline variants
 * - Loading state during retry
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  onRetry,
  isRetrying = false,
  retryLabel = 'Try Again',
  variant = 'card',
  className,
}) =>
{
  const content = (
    <>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-semibold text-destructive',
            variant === 'card' ? 'text-lg' : 'text-base',
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              'mt-1 text-destructive/80',
              variant === 'card' ? 'text-sm' : 'text-xs',
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="w-full gap-2 border-destructive/30 hover:bg-destructive/10 mt-4"
          disabled={isRetrying}
          size={variant === 'card' ? 'default' : 'sm'}
        >
          <RefreshCw className={cn('w-4 h-4', isRetrying && 'animate-spin')} />
          {isRetrying ? 'Loading...' : retryLabel}
        </Button>
      )}
    </>
  );

  if (variant === 'inline')
  {
    return (
      <div className={cn('p-4 rounded-lg bg-destructive/5 border border-destructive/20', className)}>
        {content}
      </div>
    );
  }

  return (
    <Card className={cn('border-destructive/50 bg-destructive/5', className)}>
      <CardHeader>
        {content}
      </CardHeader>
    </Card>
  );
};
