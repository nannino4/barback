import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer, Stack, Grid, Section } from '@/components/layout';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { StatusMessage } from '@/components/feedback/StatusMessage';
import { ProductDetailSkeleton, StockAdjustmentSheet } from '@/components/features/inventory';
import { ProductFormSheet } from '@/components/features/products/ProductFormSheet';
import {
  ProductActionsSheet,
  ProductDetailHeader,
  ProductHistorySection,
  ProductHistorySheet,
  ProductInfoCard,
  ProductStockCard,
} from '@/components/features/inventory/product-detail';
import { useI18n } from '@/hooks/useI18n';
import { useSmartBack } from '@/hooks/useSmartBack';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/date';
import { ApiError, getLocalizedErrorMessage, isKnownError } from '@/lib/errors';
import { notify } from '@/lib/notify';
import { ROUTES } from '@/constants/routes';
import { productApi } from '@/api/product-api';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';

import type { InventoryLogResponse, StockAdjustmentType } from '@/types/product';

const typeVariantMap: Record<StockAdjustmentType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PURCHASE: 'secondary',
  CONSUMPTION: 'destructive',
  ADJUSTMENT: 'default',
  STOCKTAKE: 'outline',
};


export const ProductDetailPage: React.FC = () =>
{
  const { orgId, productId } = useParams();
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();
  const smartBack = useSmartBack(ROUTES.INVENTORY);
  const { currentOrg } = useOrganizations();
  const currentUser = useAuthStore((state) => state.user);

  const [isAdjustmentOpen, setIsAdjustmentOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  const {
    product,
    isLoading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct,
  } = useProductDetail({
    orgId,
    productId,
  });

  const logsQuery = useQuery<InventoryLogResponse[]>({
    queryKey: queryKeys.products.logs(orgId ?? '', productId ?? ''),
    queryFn: () => productApi.getProductLogs(orgId ?? '', productId ?? ''),
    enabled: Boolean(orgId && productId),
    staleTime: CACHE_TIMES.INVENTORY_LOGS,
  });

  const logs = React.useMemo<InventoryLogResponse[]>(() =>
  {
    return logsQuery.data ?? [];
  }, [logsQuery.data]);
  const isLoadingLogs = logsQuery.isLoading;
  const logsError = logsQuery.error;
  const refetchLogs = logsQuery.refetch;

  const { categories } = useCategories({ orgId });

  const {
    deleteProduct,
    isDeleting,
    deleteProductError,
    resetDeleteProductError,
  } = useProducts({ orgId });

  const canManage = currentOrg?.role === 'OWNER' || currentOrg?.role === 'MANAGER';

  React.useEffect(() =>
  {
    if (!productError)
    {
      return;
    }

    if (ApiError.isApiError(productError) && productError.statusCode === 404)
    {
      notify.error(t('product.detail.notFound'));
      void navigate(ROUTES.INVENTORY, { replace: true });
    }
  }, [navigate, productError, t]);

  const handleDeleteOpenChange = (open: boolean) =>
  {
    setIsDeleteOpen(open);
    if (!open)
    {
      resetDeleteProductError();
    }
  };

  const handleDeleteConfirm = async () =>
  {
    if (!product)
    {
      return;
    }

    try
    {
      await deleteProduct(product.id);
      setIsDeleteOpen(false);
      void navigate(ROUTES.INVENTORY, { replace: true });
    }
    catch (error)
    {
      void error;
    }
  };

  const openAdjustmentFromActions = () =>
  {
    setIsActionsOpen(false);
    setIsAdjustmentOpen(true);
  };

  const openEditFromActions = () =>
  {
    setIsActionsOpen(false);
    setIsEditOpen(true);
  };

  const openDeleteFromActions = () =>
  {
    setIsActionsOpen(false);
    setIsDeleteOpen(true);
  };

  const handleCategoryClick = (categoryId: string) =>
  {
    void navigate(ROUTES.INVENTORY, {
      state: {
        categoryId,
      },
    });
  };

  const typeLabelMap: Record<StockAdjustmentType, string> = {
    PURCHASE: t('inventory.adjustment.types.purchase'),
    CONSUMPTION: t('inventory.adjustment.types.consumption'),
    ADJUSTMENT: t('inventory.adjustment.types.adjustment'),
    STOCKTAKE: t('inventory.adjustment.types.stocktake'),
  };

  const getTypeLabel = (type: StockAdjustmentType) =>
  {
    return typeLabelMap[type];
  };

  const getTypeVariant = (type: StockAdjustmentType) =>
  {
    return typeVariantMap[type];
  };

  const formatSignedQuantity = (quantity: number) =>
  {
    const absValue = Math.abs(quantity);
    const formatted = new Intl.NumberFormat(currentLanguage).format(absValue);

    if (quantity > 0)
    {
      return `+${formatted}`;
    }

    if (quantity < 0)
    {
      return `-${formatted}`;
    }

    return formatted;
  };

  const formatLogDate = (createdAt: string) =>
  {
    return formatDate(
      createdAt,
      currentLanguage,
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
      currentUser?.timezone,
    );
  };

  const inventoryLogsPreview = React.useMemo<InventoryLogResponse[]>(() =>
  {
    return logs.slice(0, 5);
  }, [logs]);

  const categoryBadges = React.useMemo(() =>
  {
    if (!product)
    {
      return [];
    }

    return product.categoryIds
      .map((categoryId) => categories.find((category) => category.id === categoryId))
      .filter((category): category is NonNullable<typeof category> => Boolean(category));
  }, [product, categories]);

  const deleteErrorMessage = deleteProductError && isKnownError(deleteProductError)
    ? getLocalizedErrorMessage(deleteProductError, t, 'form')
    : deleteProductError
      ? t('errors.genericError')
      : null;

  if (isLoadingProduct)
  {
    return <ProductDetailSkeleton />;
  }

  if (!product)
  {
    return (
      <PageContainer>
        <ErrorState
          title={t('product.detail.errorTitle')}
          description={t('product.detail.errorDescription')}
          onRetry={() => void refetchProduct()}
          retryLabel={t('common.tryAgain')}
        />
      </PageContainer>
    );
  }

  if (productError && !ApiError.isApiError(productError))
  {
    const message = isKnownError(productError)
      ? getLocalizedErrorMessage(productError, t, 'form')
      : t('errors.genericError');

    return (
      <PageContainer>
        <ErrorState
          title={t('product.detail.errorTitle')}
          description={message}
          onRetry={() => void refetchProduct()}
          retryLabel={t('common.tryAgain')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack space="lg">
        {/* Header + primary actions */}
        <ProductDetailHeader
          product={product}
          canManage={canManage}
          onBack={smartBack}
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
          onAdjust={() => setIsAdjustmentOpen(true)}
          onOpenActions={() => setIsActionsOpen(true)}
          t={t}
        />

        {/* Main content: info + stock */}
        <Section>
          <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }} gap="lg">
            <ProductInfoCard
              product={product}
              categoryBadges={categoryBadges}
              onCategoryClick={handleCategoryClick}
              t={t}
              currentLanguage={currentLanguage}
            />
            <ProductStockCard
              product={product}
              onAdjust={() => setIsAdjustmentOpen(true)}
              t={t}
            />
          </Grid>
        </Section>

        {/* Recent inventory history preview */}
        <ProductHistorySection
          logs={inventoryLogsPreview}
          isLoading={isLoadingLogs}
          error={logsError}
          onRetry={() => void refetchLogs()}
          onViewAll={() => setIsHistoryOpen(true)}
          t={t}
          getTypeLabel={getTypeLabel}
          getVariant={getTypeVariant}
          formatSignedQuantity={formatSignedQuantity}
          formatLogDate={formatLogDate}
        />
      </Stack>

      <StockAdjustmentSheet
        open={isAdjustmentOpen}
        onOpenChange={setIsAdjustmentOpen}
        product={product}
      />

      <ProductFormSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        product={product}
        orgId={orgId}
      />

      <ConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={handleDeleteOpenChange}
        title={t('product.detail.delete.confirmTitle', { name: product.name })}
        description={t('product.detail.delete.confirmDescription')}
        confirmLabel={t('product.detail.delete.confirmButton')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => void handleDeleteConfirm()}
        isLoading={isDeleting}
        variant="destructive"
      >
        {deleteErrorMessage && (
          <StatusMessage
            variant="error"
            title={deleteErrorMessage}
          />
        )}
      </ConfirmationDialog>

      {/* Mobile actions sheet */}
      <ProductActionsSheet
        open={isActionsOpen}
        onOpenChange={setIsActionsOpen}
        canManage={canManage}
        onAdjust={openAdjustmentFromActions}
        onEdit={openEditFromActions}
        onDelete={openDeleteFromActions}
        t={t}
      />

      {/* Full history sheet */}
      <ProductHistorySheet
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        logs={logs}
        isLoading={isLoadingLogs}
        error={logsError}
        onRetry={() => void refetchLogs()}
        t={t}
        getTypeLabel={getTypeLabel}
        getVariant={getTypeVariant}
        formatSignedQuantity={formatSignedQuantity}
        formatLogDate={formatLogDate}
      />
    </PageContainer>
  );
};

