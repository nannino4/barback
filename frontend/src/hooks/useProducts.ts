import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/notify';
import { productApi } from '@/api/product-api';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useCategories } from '@/hooks/useCategories';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';

import type {
  CreateProductRequest,
  UpdateProductRequest,
  StockAdjustmentRequest,
} from '@/types/product';

/**
 * Hook for managing products within the current organization
 * 
 * Assumes currentOrg exists - only use in pages that require org context.
 * 
 * Provides:
 * - Query for all products
 * - Categories from useCategories hook
 * - Mutations for CRUD operations
 * - Stock adjustment mutation
 */
export const useProducts = () =>
{
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { currentOrg } = useOrganizations();
  
  // Assume org exists - this hook should only be used in org-scoped pages
  const orgId = currentOrg!.org.id;

  // Get categories from dedicated hook
  const { 
    categories, 
    isLoading: isLoadingCategories,
  } = useCategories();

  // ==========================================================================
  // Queries
  // ==========================================================================

  /**
   * Query for all products in the current organization
   */
  const productsQuery = useQuery({
    queryKey: queryKeys.products.all(orgId),
    queryFn: () => productApi.getProducts(orgId),
    staleTime: CACHE_TIMES.PRODUCTS,
  });

  // ==========================================================================
  // Mutations
  // ==========================================================================

  /**
   * Mutation to create a new product
   */
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductRequest) =>
      productApi.createProduct(orgId, data),
    onSuccess: () =>
    {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.all(orgId),
      });
      notify.success(t('product.createSuccess'));
    },
  });

  /**
   * Mutation to update a product
   */
  const updateProductMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) =>
      productApi.updateProduct(orgId, productId, data),
    onSuccess: (_, variables) =>
    {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.all(orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(orgId, variables.productId),
      });
      notify.success(t('product.updateSuccess'));
    },
  });

  /**
   * Mutation to delete a product
   */
  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) =>
      productApi.deleteProduct(orgId, productId),
    onSuccess: () =>
    {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.all(orgId),
      });
      notify.success(t('product.deleteSuccess'));
    },
  });

  /**
   * Mutation to adjust stock for a product
   */
  const adjustStockMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: StockAdjustmentRequest }) =>
      productApi.adjustStock(orgId, productId, data),
    onSuccess: (_, variables) =>
    {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.all(orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(orgId, variables.productId),
      });
      notify.success(t('inventory.adjustStockSuccess'));
    },
  });

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // Data
    products: productsQuery.data ?? [],
    categories,
    
    // Loading states
    isLoadingProducts: productsQuery.isLoading,
    isLoadingCategories,
    isLoading: productsQuery.isLoading || isLoadingCategories,
    
    // Error states
    productsError: productsQuery.error,
    
    // Refetch functions
    refetchProducts: productsQuery.refetch,
    
    // Mutations
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    adjustStock: adjustStockMutation.mutateAsync,
    
    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isAdjusting: adjustStockMutation.isPending,
  };
};
