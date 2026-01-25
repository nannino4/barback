/**
 * Product types for API communication
 */

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Product response from API
 */
export interface ProductResponse
{
  id: string;
  name: string;
  description?: string;
  brand?: string;
  defaultUnit: string;
  defaultPurchasePrice?: number;
  currentQuantity: number;
  categoryIds: string[];
  imageUrl?: string;
}

/**
 * Category response from API
 */
export interface CategoryResponse
{
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

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
export type StockAdjustmentType = 
  | 'purchase' 
  | 'consumption' 
  | 'adjustment' 
  | 'stocktake';

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
export interface StockAdjustmentResponse
{
  id: string;
  type: StockAdjustmentType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  createdAt: string;
}
