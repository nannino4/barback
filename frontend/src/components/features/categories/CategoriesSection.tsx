import React from 'react';
import { FolderPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { Section, Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import {
  buildCategoryTree,
  filterCategoryTree,
} from '@/components/features/inventory/categoryFilterUtils';
import {
  ChildCategoryRowContent,
  ParentCategoryRowContent,
} from '@/components/features/categories/CategoryRowContent';
import { CategoryDetailSheet } from '@/components/features/categories/CategoryDetailSheet';
import { CategoryTree } from '@/components/features/categories/CategoryTree';
import { CategoryFormSheet } from '@/components/features/categories/CategoryFormSheet';

import type { CategoryResponse } from '@/types/category';

interface CategoriesSectionProps
{
  orgId: string;
  canManage: boolean;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  orgId,
  canManage,
}) =>
{
  const { t } = useI18n();
  const skeletonRows = React.useMemo(() => ['c1', 'c2', 'c3', 'c4'], []);
  const {
    categories,
    isLoading: isLoadingCategories,
    error,
    refetch,
    deleteCategory,
    isDeleting,
  } = useCategories({ orgId });
  const { products, isLoading: isLoadingProducts } = useProducts({ orgId });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create');
  const [activeCategory, setActiveCategory] = React.useState<CategoryResponse | null>(null);
  const [defaultParentId, setDefaultParentId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const isLoading = isLoadingCategories || isLoadingProducts;
  const isSearchActive = searchQuery.trim().length > 0;

  const categoryTree = React.useMemo(() => buildCategoryTree(categories), [categories]);

  const filteredTree = React.useMemo(() =>
  {
    return filterCategoryTree(categoryTree, searchQuery);
  }, [categoryTree, searchQuery]);

  const categoryChildrenMap = React.useMemo(() =>
  {
    const map: Record<string, string[]> = {};
    categories.forEach((category) =>
    {
      if (!category.parentId)
      {
        return;
      }

      if (!map[category.parentId])
      {
        map[category.parentId] = [];
      }

      map[category.parentId].push(category.id);
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

  const categoryProductCounts = React.useMemo(() =>
  {
    const counts: Record<string, number> = {};
    products.forEach((product) =>
    {
      product.categoryIds.forEach((categoryId) =>
      {
        counts[categoryId] = (counts[categoryId] ?? 0) + 1;
      });
    });

    return counts;
  }, [products]);

  const getSubtreeCount = React.useCallback((categoryId: string): number =>
  {
    const children = categoryChildrenMap[categoryId] ?? [];
    const directCount = categoryProductCounts[categoryId] ?? 0;

    return children.reduce((sum, childId) => sum + getSubtreeCount(childId), directCount);
  }, [categoryChildrenMap, categoryProductCounts]);

  const categoryById = React.useMemo(() =>
  {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const handleAddCategory = () =>
  {
    setActiveCategory(null);
    setDefaultParentId(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleOpenDetail = (category: CategoryResponse) =>
  {
    setActiveCategory(category);
    setIsDetailOpen(true);
  };

  const handleAddSubcategory = (category: CategoryResponse) =>
  {
    setActiveCategory(null);
    setDefaultParentId(category.id);
    setFormMode('create');
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleEditCategory = (category: CategoryResponse) =>
  {
    setActiveCategory(category);
    setDefaultParentId(null);
    setFormMode('edit');
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleDeleteCategory = (category: CategoryResponse) =>
  {
    setActiveCategory(category);
    setDeleteDialogOpen(true);
    setIsDetailOpen(false);
  };

  const confirmDeleteCategory = () =>
  {
    if (!activeCategory)
    {
      return;
    }

    void deleteCategory(activeCategory.id)
      .then(() =>
      {
        setDeleteDialogOpen(false);
        setActiveCategory(null);
      })
      .catch((error) =>
      {
        void error;
      });
  };

  const getDeleteDescription = () =>
  {
    if (!activeCategory)
    {
      return '';
    }

    const descendants = Array.from(getDescendants(activeCategory.id)).filter(
      (id) => id !== activeCategory.id,
    );
    const childCount = descendants.length;
    const productCount = categoryProductCounts[activeCategory.id] ?? 0;

    if (childCount > 0 && productCount > 0)
    {
      return t('orgManagement.categories.deleteWithProductsAndChildren', {
        name: activeCategory.name,
        childCount,
        productCount,
      });
    }

    if (childCount > 0)
    {
      return t('orgManagement.categories.deleteWithChildren', {
        name: activeCategory.name,
        count: childCount,
      });
    }

    if (productCount > 0)
    {
      return t('orgManagement.categories.deleteWithProducts', {
        name: activeCategory.name,
        count: productCount,
      });
    }

    return t('orgManagement.categories.deleteConfirm', {
      name: activeCategory.name,
    });
  };

  return (
    <Section>
      <Card>
        <CardHeader>
          <Stack direction="horizontal" space="sm" align="center">
            <FolderPlus className="w-5 h-5 text-muted-foreground" />
            <CardTitle>
              {t('orgManagement.categories.title')}{' '}
              <span className="text-muted-foreground font-normal">
                ({categories.length})
              </span>
            </CardTitle>
          </Stack>
          <CardDescription>{t('orgManagement.categories.description')}</CardDescription>
          {canManage && (
            <CardAction>
              <Button variant="outline" size="sm" onClick={handleAddCategory}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('orgManagement.categories.addButton')}</span>
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <Stack space="md">
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('orgManagement.categories.searchPlaceholder')}
              className="h-touch"
            />

            {error ? (
              <ErrorState
                title={t('orgManagement.categories.errorTitle')}
                description={t('orgManagement.categories.errorDescription')}
                onRetry={() => void refetch()}
                retryLabel={t('common.tryAgain')}
              />
            ) : isLoading ? (
              <Stack space="sm">
                {skeletonRows.map((key) => (
                  <Skeleton key={key} className="h-16 w-full rounded-xl" />
                ))}
              </Stack>
            ) : filteredTree.length > 0 ? (
              <Stack space="sm">
                <CategoryTree
                  nodes={filteredTree}
                  isSearchActive={isSearchActive}
                  expandLabel={t('orgManagement.categories.expandLabel')}
                  collapseLabel={t('orgManagement.categories.collapseLabel')}
                  renderRow={({ node, depth, leadingIcon }) =>
                  {
                    const category = categoryById.get(node.id);
                    if (!category)
                    {
                      return null;
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(category)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-3 text-left"
                      >
                        {depth === 0 ? (
                          <ParentCategoryRowContent
                            name={node.name}
                            count={getSubtreeCount(node.id)}
                            leadingIcon={leadingIcon}
                          />
                        ) : (
                          <ChildCategoryRowContent
                            name={node.name}
                            count={getSubtreeCount(node.id)}
                            leadingIcon={leadingIcon}
                          />
                        )}
                      </button>
                    );
                  }}
                />
              </Stack>
            ) : (
              <Stack space="xs" className="text-center py-8">
                <span className="text-sm font-medium">
                  {t('orgManagement.categories.emptyTitle')}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('orgManagement.categories.emptyDescription')}
                </span>
                {canManage && (
                  <div className="mt-3">
                    <Button variant="outline" onClick={handleAddCategory}>
                      {t('orgManagement.categories.addButton')}
                    </Button>
                  </div>
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <CategoryFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        category={activeCategory}
        parentId={defaultParentId}
        orgId={orgId}
      />

      <CategoryDetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        category={activeCategory}
        parentName={activeCategory?.parentId
          ? categoryById.get(activeCategory.parentId)?.name ?? null
          : null}
        canManage={canManage}
        onAddChild={() =>
        {
          if (activeCategory)
          {
            handleAddSubcategory(activeCategory);
          }
        }}
        onEdit={() =>
        {
          if (activeCategory)
          {
            handleEditCategory(activeCategory);
          }
        }}
        onDelete={() =>
        {
          if (activeCategory)
          {
            handleDeleteCategory(activeCategory);
          }
        }}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('orgManagement.categories.deleteButton')}
        description={getDeleteDescription()}
        confirmLabel={t('orgManagement.categories.deleteButton')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmDeleteCategory}
        isLoading={isDeleting}
        variant="destructive"
      />
    </Section>
  );
};
