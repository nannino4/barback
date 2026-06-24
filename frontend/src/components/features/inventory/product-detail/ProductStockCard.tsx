import React from 'react';
import { Diff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';

import type { useI18n } from '@/hooks/useI18n';
import type { ProductResponse } from '@/types/product';

type I18nT = ReturnType<typeof useI18n>['t'];

interface ProductStockCardProps
{
  product: ProductResponse;
  onAdjust: () => void;
  t: I18nT;
}

export const ProductStockCard: React.FC<ProductStockCardProps> = ({
  product,
  onAdjust,
  t,
}) =>
{
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('product.detail.stock.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack space="md">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('product.detail.stock.currentLabel')}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">
                {product.currentQuantity}
              </span>
              <span className="text-sm text-muted-foreground">
                {product.defaultUnit}
              </span>
            </div>
          </div>

          <Button className="h-touch" onClick={onAdjust}>
            <Diff className="w-4 h-4" />
            {t('inventory.adjustStock')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
