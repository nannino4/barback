/**
 * Product types for API communication
 */

import { z } from 'zod';

// =============================================================================
// Zod Schemas for API Validation
// =============================================================================

/**
 * Product response schema
 */
export const ProductResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  brand: z.string().optional(),
  defaultUnit: z.string(),
  defaultPurchasePrice: z.number().optional(),
  currentQuantity: z.number(),
  categoryIds: z.array(z.string()),
  imageUrl: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Stock adjustment type enum
 */
export const StockAdjustmentTypeSchema = z.enum([
  'PURCHASE',
  'CONSUMPTION',
  'ADJUSTMENT',
  'STOCKTAKE',
]);

/**
 * Stock adjustment response schema
 */
export const StockAdjustmentResponseSchema = z.object({
  id: z.string(),
  type: StockAdjustmentTypeSchema,
  quantity: z.number(),
  previousQuantity: z.number(),
  newQuantity: z.number(),
  note: z.string().optional(),
  createdAt: z.string(),
});

// =============================================================================
// API Response Types (inferred from schemas)
// =============================================================================

/**
 * Product response from API
 */
export type ProductResponse = z.infer<typeof ProductResponseSchema>;

// =============================================================================
// API Request Types
// =============================================================================

/**
 * Create product request
 */
export interface CreateProductRequest
{
  name: string;
  description?: string;
  brand?: string;
  defaultUnit: string;
  defaultPurchasePrice?: number;
  currentQuantity?: number;
  categoryIds?: string[];
  imageUrl?: string;
}

/**
 * Update product request
 */
export interface UpdateProductRequest
{
  name?: string;
  description?: string;
  brand?: string;
  defaultUnit?: string;
  defaultPurchasePrice?: number;
  categoryIds?: string[];
  imageUrl?: string;
}

/**
 * Stock adjustment types
 */
export type StockAdjustmentType = z.infer<typeof StockAdjustmentTypeSchema>;

/**
 * Stock adjustment request
 */
export interface StockAdjustmentRequest
{
  type: StockAdjustmentType;
  quantity: number;
  note?: string;
}

/**
 * Stock adjustment response (inventory log)
 */
export type StockAdjustmentResponse = z.infer<typeof StockAdjustmentResponseSchema>;
