import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import {
  filterCategoryTree,
  buildCategoryTree,
  type CategoryTreeNode,
} from '@/components/features/inventory/categoryFilterUtils';
import {
  ChildCategoryRowContent,
  ParentCategoryRowContent,
} from '@/components/features/categories/CategoryRowContent';
import { CategoryTree } from '@/components/features/categories/CategoryTree';
import { CategoryFormSheet } from '@/components/features/categories/CategoryFormSheet';
import { getLocalizedErrorMessage, isKnownError } from '@/lib/errors';
import { ProductFormSchema, type ProductFormData } from '@/types/product-forms';

import type { ProductResponse } from '@/types/product';
import type { CategoryResponse } from '@/types/category';

interface ProductFormSheetProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  product?: ProductResponse | null;
  orgId?: string;
}

export const ProductFormSheet: React.FC<ProductFormSheetProps> = ({
  open,
  onOpenChange,
  mode,
  product,
  orgId,
}) =>
{
  const { t } = useI18n();
  const {
    createProduct,
    updateProduct,
    isCreating,
    isUpdating,
    createProductError,
    updateProductError,
    resetCreateProductError,
    resetUpdateProductError,
  } = useProducts({ orgId });
  const { categories } = useCategories({ orgId });

  const [categorySearch, setCategorySearch] = React.useState('');
  const [isCategoryFormOpen, setIsCategoryFormOpen] = React.useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = React.useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      defaultUnit: '',
      defaultPurchasePrice: '',
      currentQuantity: '0',
      categoryIds: [],
    },
  });

  const categoryTree = React.useMemo(() => buildCategoryTree(categories), [categories]);
  const parentMap = React.useMemo(() =>
  {
    return new Map(categories.map((category) => [category.id, category.parentId ?? null]));
  }, [categories]);

  const filteredCategoryTree = React.useMemo(() =>
  {
    return filterCategoryTree(categoryTree, categorySearch);
  }, [categorySearch, categoryTree]);

  const isSearchActive = categorySearch.trim().length > 0;

  const resetCreateError = resetCreateProductError as () => void;
  const resetUpdateError = resetUpdateProductError as () => void;

  React.useEffect(() =>
  {
    if (!open)
    {
      return;
    }

    resetCreateError();
    resetUpdateError();

    form.reset({
      name: product?.name ?? '',
      brand: product?.brand ?? '',
      description: product?.description ?? '',
      defaultUnit: product?.defaultUnit ?? '',
      defaultPurchasePrice: product?.defaultPurchasePrice?.toString() ?? '',
      currentQuantity: product?.currentQuantity?.toString() ?? '0',
      categoryIds: product?.categoryIds ?? [],
    });

    setCategorySearch('');
  }, [form, open, product, resetCreateError, resetUpdateError]);

  if (mode === 'edit' && !product)
  {
    return null;
  }

  const isSaving = isCreating || isUpdating;
  const mutationError = mode === 'edit'
    ? updateProductError
    : createProductError;
  const errorMessage = mutationError && isKnownError(mutationError)
    ? getLocalizedErrorMessage(mutationError, t)
    : mutationError
      ? t('errors.genericError')
      : null;

  const handleSubmit: SubmitHandler<ProductFormData> = async () =>
  {
    const formData = form.getValues();
    const payload = {
      name: formData.name.trim(),
      defaultUnit: formData.defaultUnit.trim(),
      brand: formData.brand?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      categoryIds: formData.categoryIds && formData.categoryIds.length > 0
        ? formData.categoryIds
        : undefined,
      defaultPurchasePrice: formData.defaultPurchasePrice?.trim()
        ? Number(formData.defaultPurchasePrice)
        : undefined,
      currentQuantity: formData.currentQuantity?.trim()
        ? Number(formData.currentQuantity)
        : undefined,
    };

    try
    {
      if (mode === 'edit' && product)
      {
        await updateProduct({
          productId: product.id,
          data: {
            name: payload.name,
            defaultUnit: payload.defaultUnit,
            brand: payload.brand,
            description: payload.description,
            categoryIds: payload.categoryIds,
            defaultPurchasePrice: payload.defaultPurchasePrice,
          },
        });
        onOpenChange(false);
        return;
      }

      await createProduct(payload);
      onOpenChange(false);
    }
    catch (error)
    {
      void error;
    }
  };

  const renderCategoryLabel = (selectedIds: string[], items: CategoryResponse[]) =>
  {
    if (selectedIds.length === 0)
    {
      return t('product.form.categoriesPlaceholder');
    }

    const selectedNames = selectedIds
      .map((id) => items.find((item) => item.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    if (selectedNames.length === 0)
    {
      return t('product.form.categoriesPlaceholder');
    }

    if (selectedNames.length <= 2)
    {
      return selectedNames.join(', ');
    }

    return `${selectedNames[0]}, ${selectedNames[1]} +${selectedNames.length - 2}`;
  };

  const getAncestorIds = (categoryId: string) =>
  {
    const ancestors: string[] = [];
    let currentId = parentMap.get(categoryId) ?? null;

    while (currentId)
    {
      ancestors.push(currentId);
      currentId = parentMap.get(currentId) ?? null;
    }

    return ancestors;
  };

  const hasSelectedDescendant = (node: CategoryTreeNode, selectedSet: Set<string>): boolean =>
  {
    return node.children.some((child) =>
      selectedSet.has(child.id) || hasSelectedDescendant(child, selectedSet),
    );
  };

  const toggleCategorySelection = (categoryId: string, checked: boolean, selectedIds: string[]) =>
  {
    const nextIds = new Set(selectedIds);
    if (checked)
    {
      nextIds.add(categoryId);
      const ancestors = getAncestorIds(categoryId);
      ancestors.forEach((ancestorId) => nextIds.delete(ancestorId));
    }
    else
    {
      nextIds.delete(categoryId);
    }

    return Array.from(nextIds);
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl sm:max-w-2xl sm:mx-auto">
        <SheetHeader className="text-left">
          <SheetTitle>
            {mode === 'edit'
              ? t('product.form.editTitle')
              : t('product.form.createTitle')}
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
              <Stack space="lg">
                <Stack space="md">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('product.form.nameLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('product.form.namePlaceholder')}
                            className="h-touch"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('product.form.brandLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('product.form.brandPlaceholder')}
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
                        <FormLabel>{t('product.form.descriptionLabel')}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t('product.form.descriptionPlaceholder')}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Stack>

                <Stack space="md">
                  <FormField
                    control={form.control}
                    name="defaultUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('product.form.unitLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t('product.form.unitPlaceholder')}
                            className="h-touch"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultPurchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('product.form.purchasePriceLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            placeholder={t('product.form.purchasePricePlaceholder')}
                            className="h-touch"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {mode === 'create' && (
                    <FormField
                      control={form.control}
                      name="currentQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('product.form.initialQuantityLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step="1"
                              placeholder={t('product.form.initialQuantityPlaceholder')}
                              className="h-touch"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </Stack>

                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) =>
                  {
                    const selectedIds = Array.isArray(field.value)
                      ? field.value
                      : [];
                    const handleSelectionChange = (nextIds: string[]) =>
                    {
                      field.onChange(nextIds);
                    };

                    return (
                      <FormItem>
                        <FormLabel>{t('product.form.categoriesLabel')}</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="sm:hidden">
                              <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
                                <SheetTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between h-touch"
                                  >
                                    <span className="truncate">
                                      {renderCategoryLabel(selectedIds, categories)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {selectedIds.length}
                                    </span>
                                  </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                                  <SheetHeader className="text-left">
                                    <SheetTitle>{t('product.form.categoriesLabel')}</SheetTitle>
                                    <SheetDescription>{t('product.form.categoriesPlaceholder')}</SheetDescription>
                                  </SheetHeader>
                                  <Stack space="sm" className="mt-4">
                                    <Input
                                      type="search"
                                      placeholder={t('product.form.categoriesSearchPlaceholder')}
                                      value={categorySearch}
                                      onChange={(event) => setCategorySearch(event.target.value)}
                                    />

                                    {filteredCategoryTree.length === 0 ? (
                                      <div className="rounded-lg border border-border bg-background px-3 py-3 text-sm text-muted-foreground">
                                        {t('product.form.categoriesEmpty')}
                                      </div>
                                    ) : (
                                      <CategoryTree
                                        nodes={filteredCategoryTree}
                                        isSearchActive={isSearchActive}
                                        expandLabel={t('orgManagement.categories.expandLabel')}
                                        collapseLabel={t('orgManagement.categories.collapseLabel')}
                                        renderRow={({ node, depth, leadingIcon }) =>
                                        {
                                          const selectedSet = new Set(selectedIds);
                                          const isSelected = selectedSet.has(node.id);
                                          const hasDescendantSelected = hasSelectedDescendant(node, selectedSet);
                                          const isImplicitlySelected = isSelected || hasDescendantSelected;
                                          const isDisabled = hasDescendantSelected && !isSelected;

                                          return (
                                            <button
                                              type="button"
                                              onClick={() =>
                                              {
                                                if (isDisabled)
                                                {
                                                  return;
                                                }

                                                handleSelectionChange(
                                                  toggleCategorySelection(node.id, !isSelected, selectedIds),
                                                );
                                              }}
                                              className={
                                                'w-full rounded-lg border border-border px-3 py-3 text-left ' +
                                                'flex items-center justify-between gap-3 ' +
                                                (isImplicitlySelected ? 'bg-muted' : 'bg-background')
                                              }
                                            >
                                              {depth === 0 ? (
                                                <ParentCategoryRowContent
                                                  name={node.name}
                                                  leadingIcon={leadingIcon}
                                                  rightSlot={isImplicitlySelected ? (
                                                    <Check className="h-4 w-4 text-primary" />
                                                  ) : null}
                                                />
                                              ) : (
                                                <ChildCategoryRowContent
                                                  name={node.name}
                                                  leadingIcon={leadingIcon}
                                                  rightSlot={isImplicitlySelected ? (
                                                    <Check className="h-4 w-4 text-primary" />
                                                  ) : null}
                                                />
                                              )}
                                            </button>
                                          );
                                        }}
                                      />
                                    )}

                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setIsCategoryFormOpen(true)}
                                      className="w-full justify-start"
                                    >
                                      <Plus className="h-4 w-4" />
                                      {t('product.form.categoriesAdd')}
                                    </Button>
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
                                      {renderCategoryLabel(selectedIds, categories)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {selectedIds.length}
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-80">
                                  <DropdownMenuLabel>{t('product.form.categoriesLabel')}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <div className="px-2 pb-2">
                                    <Input
                                      type="search"
                                      placeholder={t('product.form.categoriesSearchPlaceholder')}
                                      value={categorySearch}
                                      onChange={(event) => setCategorySearch(event.target.value)}
                                    />
                                  </div>
                                  <DropdownMenuSeparator />
                                  {filteredCategoryTree.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                      {t('product.form.categoriesEmpty')}
                                    </div>
                                  ) : (
                                    <CategoryTree
                                      nodes={filteredCategoryTree}
                                      isSearchActive={isSearchActive}
                                      expandLabel={t('orgManagement.categories.expandLabel')}
                                      collapseLabel={t('orgManagement.categories.collapseLabel')}
                                      renderRow={({ node, depth, leadingIcon }) =>
                                      {
                                        const selectedSet = new Set(selectedIds);
                                        const isChecked = selectedSet.has(node.id);
                                        const hasDescendantSelected = hasSelectedDescendant(node, selectedSet);
                                        const isImplicitlySelected = isChecked || hasDescendantSelected;
                                        const isDisabled = hasDescendantSelected && !isChecked;

                                        return (
                                          <DropdownMenuCheckboxItem
                                            checked={isImplicitlySelected}
                                            disabled={isDisabled}
                                            onCheckedChange={(checked) =>
                                            {
                                              handleSelectionChange(
                                                toggleCategorySelection(node.id, checked === true, selectedIds),
                                              );
                                            }}
                                            className="rounded-md"
                                          >
                                            {depth === 0 ? (
                                              <ParentCategoryRowContent
                                                name={node.name}
                                                leadingIcon={leadingIcon}
                                              />
                                            ) : (
                                              <ChildCategoryRowContent
                                                name={node.name}
                                                leadingIcon={leadingIcon}
                                              />
                                            )}
                                          </DropdownMenuCheckboxItem>
                                        );
                                      }}
                                    />
                                  )}
                                  <DropdownMenuSeparator />
                                  <div className="px-2 pb-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => setIsCategoryFormOpen(true)}
                                      className="w-full justify-start"
                                    >
                                      <Plus className="h-4 w-4" />
                                      {t('product.form.categoriesAdd')}
                                    </Button>
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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
                        {t('product.form.saving')}
                      </>
                    ) : mode === 'edit' ? (
                      t('product.form.saveUpdate')
                    ) : (
                      t('product.form.saveCreate')
                    )}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Form>
        </Stack>
      </SheetContent>

      <CategoryFormSheet
        open={isCategoryFormOpen}
        onOpenChange={setIsCategoryFormOpen}
        mode="create"
        orgId={orgId}
        onCreated={(createdCategory) =>
        {
          const existingIds = form.getValues('categoryIds');
          const nextIds = new Set(Array.isArray(existingIds) ? existingIds : []);
          nextIds.add(createdCategory.id);
          form.setValue('categoryIds', Array.from(nextIds), {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
    </Sheet>
  );
};
