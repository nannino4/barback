import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/api/product-api';
import { useOrganizations } from '@/hooks/useOrganizations';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';

import type { ProductResponse } from '@/types/product';

interface UseProductDetailOptions
{
  orgId?: string;
  productId?: string;
  enabled?: boolean;
}

interface UseProductDetailResult
{
  product: ProductResponse | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

export const useProductDetail = ({
  orgId,
  productId,
  enabled = true,
}: UseProductDetailOptions): UseProductDetailResult =>
{
  const { currentOrg } = useOrganizations();
  const resolvedOrgId = orgId ?? currentOrg!.org.id;

  const queryEnabled = Boolean(resolvedOrgId && productId) && enabled;

  const productQuery = useQuery<ProductResponse>({
    queryKey: queryKeys.products.detail(resolvedOrgId, productId ?? ''),
    queryFn: () => productApi.getProduct(resolvedOrgId, productId ?? ''),
    enabled: queryEnabled,
    staleTime: CACHE_TIMES.PRODUCTS,
  });

  return {
    product: productQuery.data ?? null,
    isLoading: productQuery.isLoading,
    error: productQuery.error,
    refetch: productQuery.refetch,
  };
};
