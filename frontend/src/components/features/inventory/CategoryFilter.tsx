import React from 'react';
import { CategoryFilterDesktop } from '@/components/features/inventory/CategoryFilterDesktop';
import { CategoryFilterMobile } from '@/components/features/inventory/CategoryFilterMobile';
import { buildCategoryTree } from '@/components/features/inventory/categoryFilterUtils';
import { useI18n } from '@/hooks/useI18n';

interface CategoryFilterProps
{
  /**
   * Available categories
   */
  categories: { id: string; name: string; parentId?: string | null }[];
  /**
   * Currently selected category ID (null = all)
   */
  selectedCategoryId: string | null;
  /**
   * Callback when category selection changes
   */
  onCategoryChange: (categoryId: string | null) => void;
  /**
   * Product counts per category
   */
  categoryProductCounts: Record<string, number>;
  /**
   * Loading state
   */
  isLoading?: boolean;
}

const ALL_CATEGORIES_VALUE = 'all';

/**
 * CategoryFilter - Dropdown menu for category selection
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  categoryProductCounts,
  isLoading = false,
}) =>
{
  const { t } = useI18n();
  const categoryTree = React.useMemo(() =>
  {
    return buildCategoryTree(categories);
  }, [categories]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const displayText = selectedCategory?.name || t('inventory.allCategories');
  const totalCount = React.useMemo(() =>
  {
    return Object.values(categoryProductCounts).reduce((sum, count) => sum + count, 0);
  }, [categoryProductCounts]);

  const getSubtreeCount = React.useCallback((categoryId: string): number =>
  {
    const children = categories.filter((category) => category.parentId === categoryId);
    const directCount = categoryProductCounts[categoryId] || 0;
    return children.reduce((sum, child) => sum + getSubtreeCount(child.id), directCount);
  }, [categories, categoryProductCounts]);

  const selectedCount = selectedCategoryId
    ? getSubtreeCount(selectedCategoryId)
    : totalCount;

  const isDisabled = isLoading || (categories.length === 0 && selectedCategoryId === null);

  const handleValueChange = (value: string) =>
  {
    if (value === ALL_CATEGORIES_VALUE)
    {
      onCategoryChange(null);
      return;
    }

    onCategoryChange(value);
  };

  return (
    <>
      <div className="hidden md:block">
        <CategoryFilterDesktop
          displayText={displayText}
          selectedCategoryId={selectedCategoryId}
          isDisabled={isDisabled}
          totalCount={totalCount}
          selectedCount={selectedCount}
          categoryTree={categoryTree}
          getSubtreeCount={getSubtreeCount}
          onSelectValue={handleValueChange}
        />
      </div>

      <div className="block md:hidden">
        <CategoryFilterMobile
          displayText={displayText}
          selectedCategoryId={selectedCategoryId}
          isDisabled={isDisabled}
          totalCount={totalCount}
          selectedCount={selectedCount}
          categoryTree={categoryTree}
          getSubtreeCount={getSubtreeCount}
          onSelectValue={handleValueChange}
        />
      </div>
    </>
  );
};
