import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Stack } from '@/components/layout';

interface ProductListSkeletonProps
{
  /**
   * Number of skeleton rows to display
   * @default 6
   */
  count?: number;
}

/**
 * ProductListSkeleton - Loading placeholder for product list
 * 
 * Matches the ProductRow layout for visual consistency during loading.
 */
export const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({
  count = 6,
}) =>
{
  // Generate stable keys for skeleton items
  const skeletonItems = React.useMemo(
    () => Array.from({ length: count }, (_, i) => `product-skeleton-${i}`),
    [count],
  );

  return (
    <Stack space="sm">
      {skeletonItems.map((key) => (
        <ProductRowSkeleton key={key} />
      ))}
    </Stack>
  );
};

/**
 * Single product row skeleton
 */
function ProductRowSkeleton()
{
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
      {/* Image placeholder */}
      <Skeleton className="h-12 w-12 rounded-md shrink-0" />

      {/* Info section */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Name */}
        <Skeleton className="h-4 w-3/4" />
        {/* Brand + Category */}
        <Skeleton className="h-3 w-1/2" />
      </div>

      {/* Stock section */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quantity */}
        <Skeleton className="h-6 w-12" />
        {/* Unit */}
        <Skeleton className="h-4 w-8" />
      </div>

      {/* Adjust button */}
      <Skeleton className="h-10 w-10 rounded-md shrink-0" />
    </div>
  );
}
