import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/notify';
import { categoryApi } from '@/api/category-api';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';

import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category';

/**
 * Hook for managing categories within the current organization
 * 
 * Assumes currentOrg exists - only use in pages that require org context.
 * 
 * Provides:
 * - Query for all categories
 * - Mutations for CRUD operations
 */
export const useCategories = () =>
{
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { currentOrg } = useOrganizations();
  
  // Assume org exists - this hook should only be used in org-scoped pages
  const orgId = currentOrg!.org.id;

  // ==========================================================================
  // Queries
  // ==========================================================================

  /**
   * Query for all categories in the current organization
   */
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all(orgId),
    queryFn: () => categoryApi.getCategories(orgId),
    staleTime: CACHE_TIMES.CATEGORIES,
  });

  // ==========================================================================
  // Mutations
  // ==========================================================================

  /**
   * Mutation to create a new category
   */
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryApi.createCategory(orgId, data),
    onSuccess: () =>
    {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(orgId),
      });
      notify.success(t('category.createSuccess'));
    },
  });

  /**
   * Mutation to update a category
   */
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateCategoryRequest }) =>
      categoryApi.updateCategory(orgId, categoryId, data),
    onSuccess: (_, variables) =>
    {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(orgId, variables.categoryId),
      });
      notify.success(t('category.updateSuccess'));
    },
  });

  /**
   * Mutation to delete a category
   */
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) =>
      categoryApi.deleteCategory(orgId, categoryId),
    onSuccess: () =>
    {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(orgId),
      });
      notify.success(t('category.deleteSuccess'));
    },
  });

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // Data
    categories: categoriesQuery.data ?? [],
    
    // Loading states
    isLoading: categoriesQuery.isLoading,
    
    // Error states
    error: categoriesQuery.error,
    
    // Refetch
    refetch: categoriesQuery.refetch,
    
    // Mutations
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
    
    // Mutation states
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};
