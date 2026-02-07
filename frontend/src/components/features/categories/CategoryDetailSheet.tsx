import React from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';

import type { CategoryResponse } from '@/types/category';

interface CategoryDetailSheetProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryResponse | null;
  parentName?: string | null;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddChild: () => void;
}

export const CategoryDetailSheet: React.FC<CategoryDetailSheetProps> = ({
  open,
  onOpenChange,
  category,
  parentName,
  canManage,
  onEdit,
  onDelete,
  onAddChild,
}) =>
{
  const { t } = useI18n();

  if (!category)
  {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl sm:max-w-xl sm:mx-auto">
        <SheetHeader className="text-left">
          <SheetTitle>{category.name}</SheetTitle>
        </SheetHeader>

        <Stack space="md" className="mt-4">
          {category.description && (
            <p className="text-sm text-muted-foreground">
              {category.description}
            </p>
          )}

          {parentName && (
            <div className="text-sm text-muted-foreground">
              {t('category.form.parentLabel')}: {parentName}
            </div>
          )}

          {canManage && (
            <Stack space="sm">
              <Button type="button" variant="outline" onClick={onAddChild}>
                <Plus className="h-4 w-4" />
                {t('orgManagement.categories.addSubcategory')}
              </Button>
              <Button type="button" variant="outline" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                {t('orgManagement.categories.editButton')}
              </Button>
              <Button type="button" variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                {t('orgManagement.categories.deleteButton')}
              </Button>
            </Stack>
          )}
        </Stack>
      </SheetContent>
    </Sheet>
  );
};
