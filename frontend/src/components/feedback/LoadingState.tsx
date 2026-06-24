import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingStateProps
{
  /**
   * Loading message to display
   * @default 'Loading...'
   */
  message?: string;
  /**
   * Size of the spinner and text
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to center the loading state
   * @default true
   */
  centered?: boolean;
  className?: string;
}

/**
 * LoadingState - Consistent loading indicator with optional message
 * 
 * Usage:
 * ```tsx
 * // Default centered loader
 * <LoadingState message="Loading organizations..." />
 * 
 * // Inline loader (not centered)
 * <LoadingState message="Saving..." size="sm" centered={false} />
 * 
 * // Large loader for full page
 * <LoadingState size="lg" />
 * ```
 * 
 * Features:
 * - Uses design system Spinner component
 * - Responsive sizing
 * - Optional centering
 * - Customizable message
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  centered = true,
  className,
}) =>
{
  const sizeClasses = {
    sm: {
      text: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      text: 'text-sm',
      gap: 'gap-3',
    },
    lg: {
      text: 'text-base',
      gap: 'gap-4',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center',
        classes.gap,
        centered && 'justify-center min-h-[200px]',
        className,
      )}
    >
      <Spinner size={size} />
      <p className={cn('text-muted-foreground font-medium', classes.text)}>
        {message}
      </p>
    </div>
  );
};
