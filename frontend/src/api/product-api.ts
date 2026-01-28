import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  ProductResponseSchema,
  StockAdjustmentResponseSchema,
  type ProductResponse,
  type CreateProductRequest,
  type UpdateProductRequest,
  type StockAdjustmentRequest,
  type StockAdjustmentResponse,
} from '@/types/product';

// ============================================================================
// API Methods
// ============================================================================

export const productApi = {
  /**
   * Get all products for an organization
   * @param orgId Organization ID
   * @returns List of products
   */
  getProducts: (orgId: string): Promise<ProductResponse[]> =>
  {
    return apiClient.request<ProductResponse[]>(
      `/orgs/${orgId}/products`,
      { method: 'GET' },
      z.array(ProductResponseSchema),
    );
  },

  /**
   * Get a single product by ID
   * @param orgId Organization ID
   * @param productId Product ID
   * @returns The product
   */
  getProduct: (orgId: string, productId: string): Promise<ProductResponse> =>
  {
    return apiClient.request<ProductResponse>(
      `/orgs/${orgId}/products/${productId}`,
      { method: 'GET' },
      ProductResponseSchema,
    );
  },

  /**
   * Create a new product
   * @param orgId Organization ID
   * @param data Product creation data
   * @returns The created product
   */
  createProduct: (
    orgId: string,
    data: CreateProductRequest,
  ): Promise<ProductResponse> =>
  {
    return apiClient.request<ProductResponse>(
      `/orgs/${orgId}/products`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      ProductResponseSchema,
    );
  },

  /**
   * Update an existing product
   * @param orgId Organization ID
   * @param productId Product ID
   * @param data Product update data
   * @returns The updated product
   */
  updateProduct: (
    orgId: string,
    productId: string,
    data: UpdateProductRequest,
  ): Promise<ProductResponse> =>
  {
    return apiClient.request<ProductResponse>(
      `/orgs/${orgId}/products/${productId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      ProductResponseSchema,
    );
  },

  /**
   * Delete a product
   * @param orgId Organization ID
   * @param productId Product ID
   */
  deleteProduct: (orgId: string, productId: string): Promise<void> =>
  {
    return apiClient.request<void>(
      `/orgs/${orgId}/products/${productId}`,
      { method: 'DELETE' },
    );
  },

  /**
   * Adjust stock for a product
   * @param orgId Organization ID
   * @param productId Product ID
   * @param data Stock adjustment data
   * @returns The inventory log entry
   */
  adjustStock: (
    orgId: string,
    productId: string,
    data: StockAdjustmentRequest,
  ): Promise<StockAdjustmentResponse> =>
  {
    return apiClient.request<StockAdjustmentResponse>(
      `/orgs/${orgId}/products/${productId}/adjust-stock`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      StockAdjustmentResponseSchema,
    );
  },
};
