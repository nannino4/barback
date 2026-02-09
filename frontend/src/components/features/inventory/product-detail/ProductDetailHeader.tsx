import React from 'react';
import { ArrowLeft, Diff, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';

import type { useI18n } from '@/hooks/useI18n';
import type { ProductResponse } from '@/types/product';

type I18nT = ReturnType<typeof useI18n>['t'];

interface ProductDetailHeaderProps
{
  product: ProductResponse;
  canManage: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAdjust: () => void;
  onOpenActions: () => void;
  t: I18nT;
}

export const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({
  product,
  canManage,
  onBack,
  onEdit,
  onDelete,
  onAdjust,
  onOpenActions,
  t,
}) =>
{
  return (
    <Stack direction="horizontal" align="center" justify="between" className="flex-wrap gap-3">
      <Stack direction="horizontal" align="center" space="sm" className="min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-touch w-touch"
          onClick={onBack}
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Stack space="xs" className="min-w-0">
          <span className="text-lg font-semibold truncate">
            {product.name}
          </span>
          {product.brand && (
            <span className="text-sm text-muted-foreground truncate">
              {product.brand}
            </span>
          )}
        </Stack>
      </Stack>

      <Stack direction="horizontal" space="sm" align="center" className="hidden sm:flex">
        {canManage && (
          <Button variant="outline" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
            {t('product.detail.editButton')}
          </Button>
        )}
        {canManage && (
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
            {t('product.detail.deleteButton')}
          </Button>
        )}
        <Button variant="outline" onClick={onAdjust}>
          <Diff className="w-4 h-4" />
          {t('inventory.adjustStock')}
        </Button>
      </Stack>

      <Button
        variant="outline"
        size="icon"
        className="h-touch w-touch sm:hidden"
        onClick={onOpenActions}
        aria-label={t('product.detail.actionsButton')}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </Stack>
  );
};
