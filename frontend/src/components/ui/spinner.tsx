import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps
{
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className,
  text, 
}) =>
{
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn(
          'animate-spin text-primary',
          sizeClasses[size],
        )} />
        {text && (
          <p className="font-body text-sm text-muted-foreground">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Inline spinner for buttons and small spaces
export const InlineSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'sm', 
  className, 
}) =>
{
  return (
    <Loader2 className={cn(
      'animate-spin',
      sizeClasses[size],
      className,
    )} />
  );
};
