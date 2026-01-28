import React from 'react';
import { Package, PlusCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

import type { ProductResponse } from '@/types/product';
import type { CategoryResponse } from '@/types/category';

interface ProductCardProps
{
  /**
   * Product to display
   */
  product: ProductResponse;
  /**
   * Available categories (for displaying category names)
   */
  categories: CategoryResponse[];
  /**
   * Callback when card is clicked (navigate to details)
   */
  onClick: () => void;
  /**
   * Callback when adjust stock button is clicked
   */
  onAdjustStock: () => void;
}

/**
 * ProductCard - Single product item in the inventory list
 * 
 * Displays:
 * - Product image (or placeholder icon)
 * - Name and brand
 * - Category breadcrumbs
 * - Current quantity with unit
 * - Adjust stock button (±)
 * 
 * Features:
 * - Keyboard accessible (Enter/Space to click)
 * - Touch-friendly hit target
 * - Stock adjustment button stops propagation
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categories,
  onClick,
  onAdjustStock,
}) =>
{
  const { t } = useI18n();

  /**
   * Build category breadcrumb path from root to leaf
   * If 4+ levels, shows: root > ... > second-to-last > last
   */
  const categoryBreadcrumbs = React.useMemo(() =>
  {
    if (product.categoryIds.length === 0)
    {
      return null;
    }
    
    const category = categories.find((c) => c.id === product.categoryIds[0]);
    if (!category)
    {
      return null;
    }

    // Build path from leaf to root
    const path: CategoryResponse[] = [category];
    let current = category;
    
    while (current.parentId)
    {
      const parent = categories.find((c) => c.id === current.parentId);
      if (!parent) break;
      path.unshift(parent);
      current = parent;
    }

    // If 4+ levels, collapse middle: root > ... > second-to-last > last
    if (path.length >= 4)
    {
      return [
        path[0],                    // root
        { id: 'ellipsis', name: '...' } as CategoryResponse, // ellipsis placeholder
        path[path.length - 2],      // second-to-last
        path[path.length - 1],      // last
      ];
    }

    return path;
  }, [product.categoryIds, categories]);

  const handleAdjustClick = (e: React.MouseEvent) =>
  {
    e.stopPropagation(); // Prevent card click
    onAdjustStock();
  };

  const handleKeyDown = (e: React.KeyboardEvent) =>
  {
    if (e.key === 'Enter' || e.key === ' ')
    {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      variant="bordered"
      className={cn(
        // Layout
        'flex-row items-center gap-3 p-3',
        // Interactive
        'cursor-pointer',
        'hover:bg-accent/50 transition-colors',
        // Focus state
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
        // Card defaults override
        'shadow-none',
      )}
    >
      {/* Product image */}
      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <Package className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Info section */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Category breadcrumbs */}
        <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
          {categoryBreadcrumbs ? (
            categoryBreadcrumbs.map((cat, index) => (
              <React.Fragment key={cat.id}>
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                )}
                <span className="truncate">{cat.name}</span>
              </React.Fragment>
            ))
          ) : (
            <span className="italic text-muted-foreground/70">
              {t('inventory.uncategorized')}
            </span>
          )}
        </div>
        
        {/* Name and brand */}
        <p className="font-medium truncate leading-tight">
          {product.name}
        </p>
        {product.brand && (
          <span className="text-sm text-muted-foreground truncate">
            {product.brand}
          </span>
        )}
      </div>

      {/* Stock section */}
      <div className="flex items-center gap-1 shrink-0 text-right min-w-[60px]">
        <span className="text-lg font-bold tabular-nums">
          {product.currentQuantity}
        </span>
        <span className="text-sm text-muted-foreground">
          {product.defaultUnit}
        </span>
      </div>

      {/* Adjust stock button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleAdjustClick}
        className="shrink-0"
        aria-label={t('inventory.adjustStock')}
      >
        <PlusCircle className="h-4 w-4" />
      </Button>
    </Card>
  );
};
