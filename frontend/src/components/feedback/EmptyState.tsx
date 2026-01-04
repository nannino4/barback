import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { To } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps
{
  /**
   * Icon to display (Lucide icon component)
   */
  icon: LucideIcon;
  /**
   * Main heading text
   */
  title: string;
  /**
   * Supporting description text
   */
  description?: string;
  /**
   * Optional call-to-action button
   */
  action?:
    | {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'secondary' | 'outline';
      }
    | {
        label: string;
        to: To;
        variant?: 'default' | 'secondary' | 'outline';
      };
  /**
   * Size of the empty state
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * EmptyState - Consistent empty state pattern
 * 
 * Usage:
 * ```tsx
 * import { Building2 } from 'lucide-react';
 * 
 * <EmptyState
 *   icon={Building2}
 *   title="No organizations yet"
 *   description="Create your first organization to get started"
 *   action={{
 *     label: "Create Organization",
 *     onClick: () => setDialogOpen(true)
 *   }}
 * />
 * ```
 * 
 * Features:
 * - Consistent icon, text, and action button layout
 * - Responsive sizing
 * - Optional CTA button
 * - Works with all Lucide icons
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
  className,
}) =>
{
  const sizeClasses = {
    sm: {
      container: 'p-6 sm:p-8',
      icon: 'w-12 h-12',
      iconWrapper: 'w-12 h-12',
      iconSize: 'w-6 h-6',
      title: 'text-base',
      description: 'text-xs',
      maxWidth: 'max-w-sm',
    },
    md: {
      container: 'p-8 sm:p-12',
      icon: 'w-16 h-16',
      iconWrapper: 'w-16 h-16',
      iconSize: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
      maxWidth: 'max-w-md',
    },
    lg: {
      container: 'p-12 sm:p-16',
      icon: 'w-20 h-20',
      iconWrapper: 'w-20 h-20',
      iconSize: 'w-10 h-10',
      title: 'text-xl',
      description: 'text-base',
      maxWidth: 'max-w-lg',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        'border border-dashed rounded-lg text-center',
        classes.container,
        className,
      )}
    >
      <div className={cn('flex flex-col items-center gap-4', classes.maxWidth, 'mx-auto')}>
        <div className={cn(
          classes.iconWrapper,
          'rounded-full bg-muted flex items-center justify-center',
        )}>
          <Icon className={cn(classes.iconSize, 'text-muted-foreground')} />
        </div>
        <div>
          <h3 className={cn('font-semibold mb-2', classes.title)}>
            {title}
          </h3>
          {description && (
            <p className={cn('text-muted-foreground', classes.description)}>
              {description}
            </p>
          )}
        </div>
        {action && (
          'to' in action ? (
            <Button
              asChild
              variant={action.variant || 'default'}
              className="gap-2 mt-2"
              size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
            >
              <Link to={action.to}>{action.label}</Link>
            </Button>
          ) : (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="gap-2 mt-2"
              size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
            >
              {action.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
};
