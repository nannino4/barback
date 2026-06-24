import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/api/product-api';
import { useOrganizations } from '@/hooks/useOrganizations';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';

import type { InventoryLogResponse } from '@/types/product';

interface UseProductInventoryLogsOptions
{
  orgId?: string;
  productId?: string;
  enabled?: boolean;
}

interface UseProductInventoryLogsResult
{
  logs: InventoryLogResponse[];
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

export const useProductInventoryLogs = ({
  orgId,
  productId,
  enabled = true,
}: UseProductInventoryLogsOptions): UseProductInventoryLogsResult =>
{
  const { currentOrg } = useOrganizations();
  const resolvedOrgId = orgId ?? currentOrg?.org.id;

  const queryEnabled = Boolean(resolvedOrgId && productId) && enabled;

  const logsQuery = useQuery<InventoryLogResponse[]>({
    queryKey: queryKeys.products.logs(resolvedOrgId ?? '', productId ?? ''),
    queryFn: () => productApi.getProductLogs(resolvedOrgId ?? '', productId ?? ''),
    enabled: queryEnabled,
    staleTime: CACHE_TIMES.INVENTORY_LOGS,
  });

  return {
    logs: logsQuery.data ?? [],
    isLoading: logsQuery.isLoading,
    error: logsQuery.error,
    refetch: logsQuery.refetch,
  };
};
