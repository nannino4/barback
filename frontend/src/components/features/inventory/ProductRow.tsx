import React from 'react';
import { Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

import type { ProductResponse, CategoryResponse } from '@/types/product';

interface ProductRowProps
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
   * Callback when row is clicked (navigate to details)
   */
  onClick: () => void;
  /**
   * Callback when adjust stock button is clicked
   */
  onAdjustStock: () => void;
}

/**
 * ProductRow - Single product item in the inventory list
 * 
 * Displays:
 * - Product image (or placeholder icon)
 * - Name and brand
 * - Category badge (first category only for simplicity)
 * - Current quantity with unit
 * - Adjust stock button (±)
 * 
 * Features:
 * - Keyboard accessible (Enter/Space to click)
 * - Touch-friendly hit target
 * - Stock adjustment button stops propagation
 */
export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  categories,
  onClick,
  onAdjustStock,
}) =>
{
  const { t } = useI18n();

  // Get category name for display (show first category)
  const categoryName = React.useMemo(() =>
  {
    if (product.categoryIds.length === 0)
    {
      return null;
    }
    
    const category = categories.find((c) => c.id === product.categoryIds[0]);
    return category?.name || null;
  }, [product.categoryIds, categories]);

  const handleAdjustClick = (e: React.MouseEvent) =>
  {
    e.stopPropagation(); // Prevent row click
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
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={cn(
        // Layout
        'flex items-center gap-3 p-3',
        // Styling
        'rounded-lg bg-card border border-border',
        // Interactive
        'cursor-pointer',
        'hover:bg-accent/50 transition-colors',
        // Focus state
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
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
        {/* Name */}
        <p className="font-medium truncate leading-tight">
          {product.name}
        </p>
        
        {/* Brand and category */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {product.brand && (
            <span className="truncate">{product.brand}</span>
          )}
          {product.brand && categoryName && (
            <span className="shrink-0">·</span>
          )}
          {categoryName ? (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {categoryName}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground/70 italic">
              {t('inventory.uncategorized')}
            </span>
          )}
        </div>
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
    </div>
  );
};
