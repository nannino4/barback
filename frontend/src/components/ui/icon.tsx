import * as React from 'react';
import { cn } from '@/lib/utils';

interface IconProps extends React.HTMLAttributes<HTMLDivElement>
{
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'muted' | 'destructive' | 'transparent';
  mode?: 'container' | 'inline';
  children: React.ReactNode;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-12 h-12',
};

const iconSizeClasses = {
  xs: '[&_svg]:w-3 [&_svg]:h-3',
  sm: '[&_svg]:w-4 [&_svg]:h-4',
  md: '[&_svg]:w-5 [&_svg]:h-5',
  lg: '[&_svg]:w-6 [&_svg]:h-6',
};

/**
 * Icon - Container component for icons with consistent sizing and styling
 * 
 * Automatically sizes the icon element (svg) based on the size prop.
 * Use with Lucide React icons or any svg element.
 * 
 * @param size - Container and icon size: 'sm' (32px), 'md' (40px), 'lg' (48px)
 * @param variant - Color variant for different states
 * @param children - Icon element (typically Lucide React icon)
 */
export const Icon: React.FC<IconProps> = ({ 
  size = 'md',
  variant = 'default',
  mode = 'container',
  className,
  children,
  ...props
}) =>
{
  const containerVariantClasses = {
    default: 'bg-primary/10 text-primary group-hover:bg-primary/20',
    primary: 'bg-primary text-primary-foreground',
    muted: 'bg-muted text-muted-foreground',
    destructive: 'bg-destructive/10 text-destructive group-hover:bg-destructive/20',
    transparent: '',
  };

  const inlineVariantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    muted: 'text-muted-foreground',
    destructive: 'text-destructive',
    transparent: '',
  };

  if (mode === 'inline')
  {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center transition-colors',
          iconSizeClasses[size],
          inlineVariantClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
        sizeClasses[size],
        iconSizeClasses[size],
        containerVariantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
