import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { CategoryFilter } from '@/components/features/inventory/CategoryFilter';

interface InventoryToolbarProps
{
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  categories: { id: string; name: string; parentId?: string | null }[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  categoryProductCounts: Record<string, number>;
  isLoading?: boolean;
}

/**
 * Toolbar with search input and category filter
 */
export function InventoryToolbar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  categories,
  selectedCategoryId,
  onCategoryChange,
  categoryProductCounts,
  isLoading = false,
}: InventoryToolbarProps)
{
  const { t } = useI18n();

  return (
    <Stack space="sm">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('inventory.searchPlaceholder')}
          value={searchQuery}
          onChange={onSearchChange}
          className="pl-9 pr-9"
          disabled={isLoading}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={t('common.clear')}
          >
            <span className="sr-only">{t('common.clear')}</span>
            ×
          </button>
        )}
      </div>

      {/* Category filter */}
      <Stack direction="horizontal" space="sm">
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={onCategoryChange}
          categoryProductCounts={categoryProductCounts}
          isLoading={isLoading}
        />
      </Stack>
    </Stack>
  );
}
