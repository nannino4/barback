import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  CategoryResponseSchema,
  type CategoryResponse,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from '@/types/category';

// ============================================================================
// API Methods
// ============================================================================

export const categoryApi = {
  /**
   * Get all categories for an organization
   * @param orgId Organization ID
   * @returns List of categories
   */
  getCategories: (orgId: string): Promise<CategoryResponse[]> =>
  {
    return apiClient.request<CategoryResponse[]>(
      `/orgs/${orgId}/categories`,
      { method: 'GET' },
      z.array(CategoryResponseSchema),
    );
  },

  /**
   * Get a single category by ID
   * @param orgId Organization ID
   * @param categoryId Category ID
   * @returns The category
   */
  getCategory: (orgId: string, categoryId: string): Promise<CategoryResponse> =>
  {
    return apiClient.request<CategoryResponse>(
      `/orgs/${orgId}/categories/${categoryId}`,
      { method: 'GET' },
      CategoryResponseSchema,
    );
  },

  /**
   * Create a new category
   * @param orgId Organization ID
   * @param data Category creation data
   * @returns The created category
   */
  createCategory: (
    orgId: string,
    data: CreateCategoryRequest,
  ): Promise<CategoryResponse> =>
  {
    return apiClient.request<CategoryResponse>(
      `/orgs/${orgId}/categories`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      CategoryResponseSchema,
    );
  },

  /**
   * Update an existing category
   * @param orgId Organization ID
   * @param categoryId Category ID
   * @param data Category update data
   * @returns The updated category
   */
  updateCategory: (
    orgId: string,
    categoryId: string,
    data: UpdateCategoryRequest,
  ): Promise<CategoryResponse> =>
  {
    return apiClient.request<CategoryResponse>(
      `/orgs/${orgId}/categories/${categoryId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      CategoryResponseSchema,
    );
  },

  /**
   * Delete a category
   * @param orgId Organization ID
   * @param categoryId Category ID
   */
  deleteCategory: (orgId: string, categoryId: string): Promise<void> =>
  {
    return apiClient.request<void>(
      `/orgs/${orgId}/categories/${categoryId}`,
      { method: 'DELETE' },
    );
  },
};
