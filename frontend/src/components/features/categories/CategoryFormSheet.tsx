import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InlineSpinner } from '@/components/ui/spinner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { StatusMessage } from '@/components/feedback/StatusMessage';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { useCategories } from '@/hooks/useCategories';
import { buildCategoryTree } from '@/components/features/inventory/categoryFilterUtils';
import {
  ChildCategoryRowContent,
  ParentCategoryRowContent,
} from '@/components/features/categories/CategoryRowContent';
import { CategoryTree } from '@/components/features/categories/CategoryTree';
import { getLocalizedErrorMessage, isKnownError } from '@/lib/errors';
import { CategoryFormSchema, type CategoryFormData } from '@/types/category-forms';

import type { CategoryResponse } from '@/types/category';

interface CategoryFormSheetProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  category?: CategoryResponse | null;
  parentId?: string | null;
  orgId?: string;
  onCreated?: (category: CategoryResponse) => void;
}

const NONE_PARENT_VALUE = 'none';

export const CategoryFormSheet: React.FC<CategoryFormSheetProps> = ({
  open,
  onOpenChange,
  mode,
  category,
  parentId,
  orgId,
  onCreated,
}) =>
{
  const { t } = useI18n();
  const {
    categories,
    createCategory,
    updateCategory,
    isCreating,
    isUpdating,
    createCategoryError,
    updateCategoryError,
    resetCreateCategoryError,
    resetUpdateCategoryError,
  } = useCategories({ orgId });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      parentId: parentId ?? null,
    },
  });

  const categoryTree = React.useMemo(() => buildCategoryTree(categories), [categories]);
  const [isParentSheetOpen, setIsParentSheetOpen] = React.useState(false);

  const categoryChildrenMap = React.useMemo(() =>
  {
    const map: Record<string, string[]> = {};
    categories.forEach((item) =>
    {
      if (!item.parentId)
      {
        return;
      }

      if (!map[item.parentId])
      {
        map[item.parentId] = [];
      }

      map[item.parentId].push(item.id);
    });

    return map;
  }, [categories]);

  const getDescendants = React.useCallback((categoryId: string) =>
  {
    const ids = new Set<string>();
    const stack = [categoryId];

    while (stack.length > 0)
    {
      const currentId = stack.pop();
      if (!currentId)
      {
        continue;
      }

      if (ids.has(currentId))
      {
        continue;
      }

      ids.add(currentId);
      const children = categoryChildrenMap[currentId] ?? [];
      children.forEach((childId) => stack.push(childId));
    }

    return ids;
  }, [categoryChildrenMap]);

  const disabledParentIds = React.useMemo(() =>
  {
    if (!category)
    {
      return new Set<string>();
    }

    return getDescendants(category.id);
  }, [category, getDescendants]);

  const resetCreateError = resetCreateCategoryError as () => void;
  const resetUpdateError = resetUpdateCategoryError as () => void;

  React.useEffect(() =>
  {
    if (!open)
    {
      return;
    }

    resetCreateError();
    resetUpdateError();

    form.reset({
      name: category?.name ?? '',
      description: category?.description ?? '',
      parentId: category?.parentId ?? parentId ?? null,
    });
  }, [category, form, open, parentId, resetCreateError, resetUpdateError]);

  const isSaving = isCreating || isUpdating;


  const handleSubmit: SubmitHandler<CategoryFormData> = async (data) =>
  {
    const trimmedName = data.name.trim();
    const trimmedDescription = data.description?.trim();
    const nextParentId = data.parentId && data.parentId !== NONE_PARENT_VALUE
      ? data.parentId
      : null;

    try
    {
      if (mode === 'edit' && category)
      {
        await updateCategory({
          categoryId: category.id,
          data: {
            name: trimmedName,
            description: trimmedDescription || undefined,
            parentId: nextParentId,
          },
        });
        onOpenChange(false);
        return;
      }

      const created = await createCategory({
        name: trimmedName,
        description: trimmedDescription || undefined,
        parentId: nextParentId || undefined,
      });

      onCreated?.(created);
      onOpenChange(false);
    }
    catch (error)
    {
      void error;
    }
  };

  const mutationError = mode === 'edit'
    ? updateCategoryError
    : createCategoryError;
  const errorMessage = mutationError && isKnownError(mutationError)
    ? getLocalizedErrorMessage(mutationError, t)
    : mutationError
      ? t('errors.genericError')
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl sm:max-w-xl sm:mx-auto">
        <SheetHeader className="text-left">
          <SheetTitle>
            {mode === 'edit'
              ? t('category.form.editTitle')
              : t('category.form.createTitle')}
          </SheetTitle>
        </SheetHeader>

        <Stack space="lg" className="mt-4">
          {errorMessage && (
            <StatusMessage
              variant="error"
              title={t('common.error')}
              description={errorMessage}
            />
          )}

          <Form {...form}>
            <form
              onSubmit={(event) =>
              {
                event.preventDefault();
                void form.handleSubmit(handleSubmit)(event);
              }}
              noValidate
            >
              <Stack space="md">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category.form.nameLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('category.form.namePlaceholder')}
                          autoFocus
                          className="h-touch"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category.form.descriptionLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t('category.form.descriptionPlaceholder')}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category.form.parentLabel')}</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="sm:hidden">
                            <Sheet open={isParentSheetOpen} onOpenChange={setIsParentSheetOpen}>
                              <SheetTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-between h-touch"
                                >
                                  <span className="truncate">
                                    {field.value
                                      ? categories.find((item) => item.id === field.value)?.name
                                      : t('category.form.parentPlaceholder')}
                                  </span>
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                                <SheetHeader className="text-left">
                                  <SheetTitle>{t('category.form.parentLabel')}</SheetTitle>
                                </SheetHeader>
                                <Stack space="sm" className="mt-4">
                                  <button
                                    type="button"
                                    onClick={() =>
                                    {
                                      field.onChange(null);
                                      setIsParentSheetOpen(false);
                                    }}
                                    className="w-full rounded-lg border border-border px-3 py-3 text-left"
                                  >
                                    {t('category.form.parentPlaceholder')}
                                  </button>
                                  <CategoryTree
                                    nodes={categoryTree}
                                    expandLabel={t('orgManagement.categories.expandLabel')}
                                    collapseLabel={t('orgManagement.categories.collapseLabel')}
                                    renderRow={({ node, depth, leadingIcon }) => (
                                      <button
                                        type="button"
                                        onClick={() =>
                                        {
                                          if (disabledParentIds.has(node.id))
                                          {
                                            return;
                                          }
                                          field.onChange(node.id);
                                          setIsParentSheetOpen(false);
                                        }}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-3 text-left"
                                      >
                                        {depth === 0 ? (
                                          <ParentCategoryRowContent
                                            name={node.name}
                                            nameClassName="font-medium"
                                            leadingIcon={leadingIcon}
                                          />
                                        ) : (
                                          <ChildCategoryRowContent
                                            name={node.name}
                                            leadingIcon={leadingIcon}
                                          />
                                        )}
                                      </button>
                                    )}
                                  />
                                </Stack>
                              </SheetContent>
                            </Sheet>
                          </div>

                          <div className="hidden sm:block">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-between h-touch"
                                >
                                  <span className="truncate">
                                    {field.value
                                      ? categories.find((item) => item.id === field.value)?.name
                                      : t('category.form.parentPlaceholder')}
                                  </span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-72">
                                <DropdownMenuLabel>{t('category.form.parentLabel')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                  value={field.value ?? NONE_PARENT_VALUE}
                                  onValueChange={(value) =>
                                  {
                                    field.onChange(value === NONE_PARENT_VALUE ? null : value);
                                  }}
                                >
                                  <DropdownMenuRadioItem value={NONE_PARENT_VALUE}>
                                    {t('category.form.parentPlaceholder')}
                                  </DropdownMenuRadioItem>
                                  <CategoryTree
                                    nodes={categoryTree}
                                    expandLabel={t('orgManagement.categories.expandLabel')}
                                    collapseLabel={t('orgManagement.categories.collapseLabel')}
                                    renderRow={({ node, depth, leadingIcon }) => (
                                      <DropdownMenuRadioItem
                                        value={node.id}
                                        disabled={disabledParentIds.has(node.id)}
                                        className="rounded-md"
                                      >
                                        {depth === 0 ? (
                                          <ParentCategoryRowContent
                                            name={node.name}
                                            nameClassName="font-medium"
                                            leadingIcon={leadingIcon}
                                          />
                                        ) : (
                                          <ChildCategoryRowContent
                                            name={node.name}
                                            leadingIcon={leadingIcon}
                                          />
                                        )}
                                      </DropdownMenuRadioItem>
                                    )}
                                  />
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Stack direction="horizontal" space="sm" justify="end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSaving}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <InlineSpinner className="mr-2" size="sm" />
                        {t('category.form.saving')}
                      </>
                    ) : mode === 'edit' ? (
                      t('category.form.saveUpdate')
                    ) : (
                      t('category.form.saveCreate')
                    )}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Form>
        </Stack>
      </SheetContent>
    </Sheet>
  );
};
