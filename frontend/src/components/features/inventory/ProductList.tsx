import React from 'react';
import { Stack } from '@/components/layout';
import { ProductRow } from './ProductRow';

import type { ProductResponse } from '@/types/product';
import type { CategoryResponse } from '@/types/category';

interface ProductListProps
{
  /**
   * Products to display
   */
  products: ProductResponse[];
  /**
   * Available categories (for displaying category names in rows)
   */
  categories: CategoryResponse[];
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
 */
export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  onProductClick,
  onAdjustStock,
}) =>
{
  return (
    <Stack space="sm">
      {products.map((product) => (
        <ProductRow
          key={product.id}
          product={product}
          categories={categories}
          onClick={() => onProductClick(product.id)}
          onAdjustStock={() => onAdjustStock(product.id)}
        />
      ))}
    </Stack>
  );
};
