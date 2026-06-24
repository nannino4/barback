import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Section, Stack } from '@/components/layout';
import { InventoryLogRow } from './InventoryLogRow';

import type { useI18n } from '@/hooks/useI18n';
import type { InventoryLogResponse, StockAdjustmentType } from '@/types/product';

type I18nT = ReturnType<typeof useI18n>['t'];

type VariantType = 'default' | 'secondary' | 'destructive' | 'outline';

interface ProductHistorySectionProps
{
  logs: InventoryLogResponse[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onViewAll: () => void;
  t: I18nT;
  getTypeLabel: (type: StockAdjustmentType) => string;
  getVariant: (type: StockAdjustmentType) => VariantType;
  formatSignedQuantity: (quantity: number) => string;
  formatLogDate: (createdAt: string) => string;
}

export const ProductHistorySection: React.FC<ProductHistorySectionProps> = ({
  logs,
  isLoading,
  error,
  onRetry,
  onViewAll,
  t,
  getTypeLabel,
  getVariant,
  formatSignedQuantity,
  formatLogDate,
}) =>
{
  return (
    <Section spacing="lg">
      <Card>
        <CardHeader>
          <Stack direction="horizontal" align="center" justify="between">
            <CardTitle>{t('product.detail.history.title')}</CardTitle>
            <Button
              variant="ghost"
              onClick={onViewAll}
              className="h-touch"
            >
              {t('product.detail.history.viewAll')}
            </Button>
          </Stack>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </Section>
  );
};
