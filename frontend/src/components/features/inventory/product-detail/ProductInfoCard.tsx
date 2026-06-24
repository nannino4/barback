import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stack } from '@/components/layout';
import { formatCurrency } from '@/lib/formatters/formatCurrency';

import type { useI18n } from '@/hooks/useI18n';
import type { CategoryResponse } from '@/types/category';
import type { ProductResponse } from '@/types/product';

type I18nT = ReturnType<typeof useI18n>['t'];

interface ProductInfoCardProps
{
  product: ProductResponse;
  categoryBadges: CategoryResponse[];
  onCategoryClick: (categoryId: string) => void;
  t: I18nT;
  currentLanguage: string;
}

export const ProductInfoCard: React.FC<ProductInfoCardProps> = ({
  product,
  categoryBadges,
  onCategoryClick,
  t,
  currentLanguage,
}) =>
{
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('product.detail.info.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Stack space="md">
          <div className="w-full h-48 sm:h-56 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-10 h-10 text-muted-foreground" />
            )}
          </div>

          <Stack space="sm">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('product.detail.info.descriptionLabel')}
              </p>
              <p className="text-sm">
                {product.description?.trim()
                  ? product.description
                  : '-'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {t('product.detail.info.categoriesLabel')}
              </p>
              {categoryBadges.length > 0 ? (
                <Stack direction="horizontal" space="xs" className="flex-wrap">
                  {categoryBadges.map((category) => (
                    <Badge
                      key={category.id}
                      variant="secondary"
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => onCategoryClick(category.id)}
                      onKeyDown={(event) =>
                      {
                        if (event.key === 'Enter' || event.key === ' ')
                        {
                          event.preventDefault();
                          onCategoryClick(category.id);
                        }
                      }}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </Stack>
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  {t('inventory.uncategorized')}
                </span>
              )}
            </div>

            <Stack space="sm">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('product.detail.info.unitLabel')}
                </p>
                <p className="text-sm">
                  {product.defaultUnit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('product.detail.info.purchasePriceLabel')}
                </p>
                <p className="text-sm">
                  {typeof product.defaultPurchasePrice === 'number'
                    ? formatCurrency(
                      product.defaultPurchasePrice,
                      currentLanguage,
                    )
                    : t('product.detail.info.notProvided')}
                </p>
              </div>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
