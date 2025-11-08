import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusMessageProps
{
  /**
   * Type of status message
   */
  variant: 'success' | 'error' | 'warning' | 'info';
  /**
   * Message title
   */
  title: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Custom icon (overrides default variant icon)
   */
  icon?: LucideIcon;
  /**
   * Dismissible with close button
   * @default false
   */
  dismissible?: boolean;
  /**
   * Callback when dismissed
   */
  onDismiss?: () => void;
  className?: string;
}

/**
 * StatusMessage - Contextual feedback messages
 * 
 * Usage:
 * ```tsx
 * // Success message
 * <StatusMessage
 *   variant="success"
 *   title="Organization created"
 *   description="Your new organization is ready to use"
 * />
 * 
 * // Error message with dismiss
 * <StatusMessage
 *   variant="error"
 *   title="Failed to save"
 *   dismissible
 *   onDismiss={() => setError(null)}
 * />
 * 
 * // Warning with custom icon
 * <StatusMessage
 *   variant="warning"
 *   title="Trial expires soon"
 *   description="Your trial ends in 3 days"
 *   icon={Clock}
 * />
 * ```
 * 
 * Features:
 * - Four semantic variants (success, error, warning, info)
 * - Optional dismissible state
 * - Custom or default icons
 * - Consistent styling
 */
export const StatusMessage: React.FC<StatusMessageProps> = ({
  variant,
  title,
  description,
  icon,
  dismissible = false,
  onDismiss,
  className,
}) =>
{
  const variantConfig = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      iconColor: 'text-success',
      titleColor: 'text-success',
      descColor: 'text-success/90',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      iconColor: 'text-destructive',
      titleColor: 'text-destructive',
      descColor: 'text-destructive/80',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      iconColor: 'text-warning',
      titleColor: 'text-warning',
      descColor: 'text-warning/90',
    },
    info: {
      icon: Info,
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
      iconColor: 'text-info',
      titleColor: 'text-info',
      descColor: 'text-info/90',
    },
  };

  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        config.bgColor,
        config.borderColor,
        className,
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', config.titleColor)}>
          {title}
        </p>
        {description && (
          <p className={cn('text-xs mt-1', config.descColor)}>
            {description}
          </p>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors',
            config.iconColor,
          )}
          aria-label="Dismiss"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
