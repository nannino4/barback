import React from 'react';
import { Diff, Pencil, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';

import type { useI18n } from '@/hooks/useI18n';

type I18nT = ReturnType<typeof useI18n>['t'];

interface ProductActionsSheetProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
  onAdjust: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: I18nT;
}

export const ProductActionsSheet: React.FC<ProductActionsSheetProps> = ({
  open,
  onOpenChange,
  canManage,
  onAdjust,
  onEdit,
  onDelete,
  t,
}) =>
{
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pt-10">
        <SheetHeader>
          <SheetTitle>{t('product.detail.actionsTitle')}</SheetTitle>
        </SheetHeader>
        <Stack space="sm" className="mt-6">
          <Button className="h-touch" onClick={onAdjust}>
            <Diff className="w-4 h-4" />
            {t('inventory.adjustStock')}
          </Button>
          {canManage && (
            <Button variant="outline" className="h-touch" onClick={onEdit}>
              <Pencil className="w-4 h-4" />
              {t('product.detail.editButton')}
            </Button>
          )}
          {canManage && (
            <Button
              variant="destructive"
              className="h-touch"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
              {t('product.detail.deleteButton')}
            </Button>
          )}
        </Stack>
      </SheetContent>
    </Sheet>
  );
};
