import React from 'react';
import { ChevronDown, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';

interface CategoryFilterPlaceholderProps
{
  /**
   * Available categories
   */
  categories: { id: string; name: string }[];
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

/**
 * CategoryFilterPlaceholder - Temporary category filter component
 * 
 * This is a placeholder that shows a simple button.
 * Will be replaced with a proper dropdown/sheet in Checkpoint 5.
 */
export const CategoryFilterPlaceholder: React.FC<CategoryFilterPlaceholderProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  categoryProductCounts,
  isLoading = false,
}) =>
{
  const { t } = useI18n();

  // Find selected category name
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const displayText = selectedCategory?.name || t('inventory.allCategories');

  // Placeholder: just show a button that logs to console
  const handleClick = () =>
  {
    // TODO: Open category filter dropdown/sheet (Checkpoint 5)
    console.log('Category filter clicked', { categories, selectedCategoryId, categoryProductCounts });
    
    // For now, cycle through: all -> first category -> all
    if (selectedCategoryId === null && categories.length > 0)
    {
      onCategoryChange(categories[0].id);
    }
    else
    {
      onCategoryChange(null);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isLoading || categories.length === 0}
      className="min-w-[140px] justify-between"
    >
      <span className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        <span className="truncate">{displayText}</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );
};
