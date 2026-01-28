/**
 * Category types for API communication
 */

import { z } from 'zod';

// =============================================================================
// Zod Schemas for API Validation
// =============================================================================

/**
 * Category response schema
 */
export const CategoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

// =============================================================================
// API Response Types (inferred from schemas)
// =============================================================================

/**
 * Category response from API
 */
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

// =============================================================================
// API Request Types
// =============================================================================

/**
 * Create category request
 */
export interface CreateCategoryRequest
{
  name: string;
  description?: string;
  parentId?: string;
}

/**
 * Update category request
 */
export interface UpdateCategoryRequest
{
  name?: string;
  description?: string;
  parentId?: string | null;
}
