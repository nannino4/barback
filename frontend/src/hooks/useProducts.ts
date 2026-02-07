import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/notify';
import { productApi } from '@/api/product-api';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';

import type {
  CreateProductRequest,
  UpdateProductRequest,
  StockAdjustmentRequest,
  ProductResponse,
  StockAdjustmentResponse,
} from '@/types/product';

/**
 * Hook for managing products within the current organization
 * 
 * Assumes currentOrg exists - only use in pages that require org context.
 * 
 * Provides:
 * - Query for all products
 * - Mutations for CRUD operations
 * - Stock adjustment mutation
 */
interface UseProductsOptions
{
  orgId?: string;
}

interface UseProductsResult
{
  products: ProductResponse[];
  isLoading: boolean;
  refetchProducts: () => Promise<unknown>;
  createProduct: (data: CreateProductRequest) => Promise<ProductResponse>;
  updateProduct: (payload: { productId: string; data: UpdateProductRequest }) => Promise<ProductResponse>;
  deleteProduct: (productId: string) => Promise<void>;
  adjustStock: (payload: { productId: string; data: StockAdjustmentRequest }) => Promise<StockAdjustmentResponse>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isAdjusting: boolean;
  productsError: unknown;
  createProductError: unknown;
  updateProductError: unknown;
  deleteProductError: unknown;
  adjustStockError: unknown;
  resetAdjustStockError: () => void;
  resetCreateProductError: () => void;
  resetUpdateProductError: () => void;
  resetDeleteProductError: () => void;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsResult =>
{
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { currentOrg } = useOrganizations();
  const orgId = options.orgId ?? currentOrg!.org.id;

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
    
    // Loading states
    isLoading: productsQuery.isLoading,
    
    // Error states
    productsError: productsQuery.error,
    createProductError: createProductMutation.error,
    updateProductError: updateProductMutation.error,
    deleteProductError: deleteProductMutation.error,
    
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
    adjustStockError: adjustStockMutation.error,
    resetAdjustStockError: adjustStockMutation.reset,
    resetCreateProductError: createProductMutation.reset,
    resetUpdateProductError: updateProductMutation.reset,
    resetDeleteProductError: deleteProductMutation.reset,
  };
};
