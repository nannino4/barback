import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps
{
  children: React.ReactNode;
  className?: string;
  /**
   * Number of columns on different screen sizes
   * @default { mobile: 1, tablet: 2, desktop: 3 }
   */
  cols?: {
    mobile?: 1 | 2;
    tablet?: 2 | 3 | 4;
    desktop?: 2 | 3 | 4 | 5 | 6;
  };
  /**
   * Gap between grid items
   * @default 'md'
   */
  gap?: 'sm' | 'md' | 'lg';
}

const DEFAULT_COLS = { mobile: 1, tablet: 2, desktop: 3 } as const;

/**
 * Grid - Responsive grid layout with consistent spacing
 * 
 * Usage:
 * ```tsx
 * // Default: 1 col mobile, 2 cols tablet, 3 cols desktop
 * <Grid>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * 
 * // Custom columns: 1 mobile, 2 tablet, 4 desktop
 * <Grid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
 *   <ProductCard />
 *   <ProductCard />
 * </Grid>
 * 
 * // Two-column layout (common for forms)
 * <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }} gap="sm">
 *   <Input label="First Name" />
 *   <Input label="Last Name" />
 * </Grid>
 * ```
 * 
 * Gap Scale:
 * - sm: 0.5rem (8px)
 * - md: 1rem (16px) - default
 * - lg: 1.5rem (24px)
 */
export const Grid: React.FC<GridProps> = ({
  children,
  className,
  cols = DEFAULT_COLS,
  gap = 'md',
}) =>
{
  const { mobile = 1, tablet = 2, desktop = 3 } = cols;

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const colClasses = {
    mobile: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
    }[mobile],
    tablet: {
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-3',
      4: 'sm:grid-cols-4',
    }[tablet],
    desktop: {
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-4',
      5: 'md:grid-cols-5',
      6: 'md:grid-cols-6',
    }[desktop],
  };

  return (
    <div
      className={cn(
        'grid',
        colClasses.mobile,
        colClasses.tablet,
        colClasses.desktop,
        gapClasses[gap],
        className,
      )}
    >
      {children}
    </div>
  );
};
