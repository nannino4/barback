import React from 'react';
import { Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';

import type { ProductResponse } from '@/types/product';
import type { CategoryResponse } from '@/types/category';

interface ProductAdminRowProps
{
  product: ProductResponse;
  categories: CategoryResponse[];
  canManage: boolean;
  onEdit?: () => void;
}

export const ProductAdminRow: React.FC<ProductAdminRowProps> = ({
  product,
  categories,
  canManage,
  onEdit,
}) =>
{
  const { t } = useI18n();

  const categoryNames = React.useMemo(() =>
  {
    const names = product.categoryIds
      .map((categoryId) => categories.find((category) => category.id === categoryId)?.name)
      .filter((name): name is string => Boolean(name));

    return names;
  }, [categories, product.categoryIds]);

  const visibleCategories = categoryNames.slice(0, 2);
  const remainingCount = Math.max(0, categoryNames.length - visibleCategories.length);

  return (
    <Card variant="bordered" className="p-3">
      <Stack direction="horizontal" space="md" align="center" justify="between" className="w-full">
        <Stack space="xs" className="min-w-0">
          <span className="font-medium truncate">
            {product.name}
          </span>
          {product.brand && (
            <span className="text-sm text-muted-foreground truncate">
              {product.brand}
            </span>
          )}
          {categoryNames.length > 0 ? (
            <Stack direction="horizontal" space="xs" className="flex-wrap">
              {visibleCategories.map((name) => (
                <Badge key={name} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{remainingCount}
                </Badge>
              )}
            </Stack>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t('inventory.uncategorized')}
            </span>
          )}
        </Stack>

        <Stack direction="horizontal" space="md" align="center" className="shrink-0">
          <div className="text-right">
            <div className="text-lg font-semibold tabular-nums">
              {product.currentQuantity}
            </div>
            <div className="text-xs text-muted-foreground">
              {product.defaultUnit}
            </div>
          </div>

          {canManage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-touch"
              aria-label={t('orgManagement.products.editButton')}
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">{t('orgManagement.products.editButton')}</span>
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
