import React from 'react';
import { Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';

import type { ProductResponse } from '@/types/product';

interface ProductListProps
{
  /**
   * Products to display
   */
  products: ProductResponse[];
  /**
   * Callback when a product row is clicked (navigate to details)
   */
  onProductClick: (productId: string) => void;
  /**
   * Callback when adjust stock button is clicked
   */
  onAdjustStock: (productId: string) => void;
}

/**
 * ProductList - Displays products in a list view
 * 
 * Each row shows:
 * - Product image (or placeholder)
 * - Name and brand
 * - Category badge
 * - Current quantity with unit
 * - Adjust stock button (±)
 * 
 * TODO: Implement ProductRow component (Checkpoint 3)
 */
export const ProductList: React.FC<ProductListProps> = ({
  products,
  onProductClick,
  onAdjustStock,
}) =>
{
  // Placeholder implementation - will be replaced with actual ProductRow components
  return (
    <Stack space="sm">
      {products.map((product) => (
        <ProductRowPlaceholder
          key={product.id}
          product={product}
          onClick={() => onProductClick(product.id)}
          onAdjustStock={() => onAdjustStock(product.id)}
        />
      ))}
    </Stack>
  );
};

interface ProductRowPlaceholderProps
{
  product: ProductResponse;
  onClick: () => void;
  onAdjustStock: () => void;
}

/**
 * Temporary placeholder for ProductRow
 * Will be replaced with full implementation in Checkpoint 3
 */
function ProductRowPlaceholder({
  product,
  onClick,
  onAdjustStock,
}: ProductRowPlaceholderProps)
{
  const { t } = useI18n();

  const handleAdjustClick = (e: React.MouseEvent) =>
  {
    e.stopPropagation(); // Prevent row click
    onAdjustStock();
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border cursor-pointer hover:bg-accent/50 transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
      {
        if (e.key === 'Enter' || e.key === ' ')
        {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Image placeholder */}
      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0">
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
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{product.name}</p>
        <p className="text-sm text-muted-foreground truncate">
          {product.brand && <span>{product.brand}</span>}
          {product.brand && ' · '}
          <span className="text-xs">
            {/* TODO: Show category name (Checkpoint 4) */}
            {product.categoryIds.length > 0 
              ? t('inventory.category') 
              : t('inventory.uncategorized')}
          </span>
        </p>
      </div>

      {/* Stock section */}
      <div className="flex items-center gap-1 shrink-0 text-right">
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
}
