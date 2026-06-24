import React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Divider - Visual separator component
 * 
 * A semantic component for separating content sections.
 * 
 * Usage:
 * ```tsx
 * <Stack space="md">
 *   <Card>Content 1</Card>
 *   <Divider />
 *   <Card>Content 2</Card>
 * </Stack>
 * ```
 */
export const Divider: React.FC<DividerProps> = ({
  className,
  orientation = 'horizontal',
}) =>
{
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'border-border',
        orientation === 'horizontal' ? 'border-t w-full' : 'border-l h-full',
        className,
      )}
    />
  );
};
