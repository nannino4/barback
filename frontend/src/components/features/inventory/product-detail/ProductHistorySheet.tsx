import React from 'react';
import { Package } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Stack } from '@/components/layout';
import { InventoryLogRow } from './InventoryLogRow';

import type { useI18n } from '@/hooks/useI18n';
import type { InventoryLogResponse, StockAdjustmentType } from '@/types/product';

type I18nT = ReturnType<typeof useI18n>['t'];

type VariantType = 'default' | 'secondary' | 'destructive' | 'outline';

interface ProductHistorySheetProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logs: InventoryLogResponse[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  t: I18nT;
  getTypeLabel: (type: StockAdjustmentType) => string;
  getVariant: (type: StockAdjustmentType) => VariantType;
  formatSignedQuantity: (quantity: number) => string;
  formatLogDate: (createdAt: string) => string;
}

export const ProductHistorySheet: React.FC<ProductHistorySheetProps> = ({
  open,
  onOpenChange,
  logs,
  isLoading,
  error,
  onRetry,
  t,
  getTypeLabel,
  getVariant,
  formatSignedQuantity,
  formatLogDate,
}) =>
{
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pt-10">
        <SheetHeader>
          <SheetTitle>{t('product.detail.history.fullTitle')}</SheetTitle>
        </SheetHeader>
        <Stack space="sm" className="mt-6">
          {error ? (
            <ErrorState
              variant="inline"
              title={t('product.detail.history.errorTitle')}
              description={t('product.detail.history.errorDescription')}
              onRetry={onRetry}
              retryLabel={t('common.tryAgain')}
            />
          ) : isLoading ? (
            <Stack space="sm">
              <div className="h-12 rounded-lg bg-muted animate-pulse" />
              <div className="h-12 rounded-lg bg-muted animate-pulse" />
              <div className="h-12 rounded-lg bg-muted animate-pulse" />
            </Stack>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t('product.detail.history.emptyTitle')}
              description={t('product.detail.history.emptyDescription')}
              size="sm"
            />
          ) : (
            <Stack space="sm">
              {logs.map((log) => (
                <InventoryLogRow
                  key={log.id}
                  log={log}
                  label={getTypeLabel(log.type)}
                  variant={getVariant(log.type)}
                  quantity={formatSignedQuantity(log.quantity)}
                  dateLabel={formatLogDate(log.createdAt)}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </SheetContent>
    </Sheet>
  );
};
