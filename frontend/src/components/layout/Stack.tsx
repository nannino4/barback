import React from 'react';
import { cn } from '@/lib/utils';

interface StackProps
{
  children: React.ReactNode;
  className?: string;
  /**
   * Spacing between stacked elements
   * @default 'md'
   */
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Direction of the stack
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * Alignment of items
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
}

/**
 * Stack - Layout component for consistent spacing between elements
 * 
 * Usage:
 * ```tsx
 * // Vertical stack (default)
 * <Stack space="md">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Stack>
 * 
 * // Horizontal stack with smaller spacing
 * <Stack direction="horizontal" space="sm" align="center">
 *   <Button>Cancel</Button>
 *   <Button>Save</Button>
 * </Stack>
 * ```
 * 
 * Spacing Scale:
 * - xs: 0.25rem (4px)
 * - sm: 0.5rem (8px)
 * - md: 1rem (16px) - default
 * - lg: 1.5rem (24px)
 * - xl: 2rem (32px)
 */
export const Stack: React.FC<StackProps> = ({
  children,
  className,
  space = 'md',
  direction = 'vertical',
  align,
}) =>
{
  const spacingClasses = {
    xs: direction === 'vertical' ? 'space-y-1' : 'space-x-1',
    sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    xl: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
  };

  const alignmentClasses = align ? {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align] : '';

  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        spacingClasses[space],
        alignmentClasses,
        className,
      )}
    >
      {children}
    </div>
  );
};
