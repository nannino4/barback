import React from 'react';
import { Search, ChevronDown, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Stack } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { filterCategoryTree } from '@/components/features/inventory/categoryFilterUtils';
import {
  ChildCategoryRowContent,
  ParentCategoryRowContent,
} from '@/components/features/categories/CategoryRowContent';
import { CategoryTree } from '@/components/features/categories/CategoryTree';
import { useI18n } from '@/hooks/useI18n';

import type { CategoryTreeNode } from '@/components/features/inventory/categoryFilterUtils';

interface CategoryFilterDesktopProps
{
  displayText: string;
  selectedCategoryId: string | null;
  isDisabled: boolean;
  totalCount: number;
  selectedCount: number;
  categoryTree: CategoryTreeNode[];
  getSubtreeCount: (categoryId: string) => number;
  onSelectValue: (value: string) => void;
}

const ALL_CATEGORIES_VALUE = 'all';

export const CategoryFilterDesktop: React.FC<CategoryFilterDesktopProps> = ({
  displayText,
  selectedCategoryId,
  isDisabled,
  totalCount,
  selectedCount,
  categoryTree,
  getSubtreeCount,
  onSelectValue,
}) =>
{
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredTree = React.useMemo(() =>
  {
    return filterCategoryTree(categoryTree, searchQuery);
  }, [categoryTree, searchQuery]);

  const hasResults = filteredTree.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
  {
    setSearchQuery(event.target.value);
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isDisabled}
          className="min-w-[160px] justify-between"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Tag className="h-4 w-4" />
            <span className="truncate">{displayText}</span>
          </span>
          <Stack direction="horizontal" space="xs" align="center">
            <Badge variant="secondary" className="text-xs">
              {selectedCount}
            </Badge>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Stack>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>{t('inventory.category')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('inventory.categorySearchPlaceholder')}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 pr-3"
            />
          </div>
        </div>
        <DropdownMenuRadioGroup
          value={selectedCategoryId ?? ALL_CATEGORIES_VALUE}
          onValueChange={onSelectValue}
        >
          <div className="px-2">
            <DropdownMenuRadioItem value={ALL_CATEGORIES_VALUE} className="rounded-md">
              <ParentCategoryRowContent
                name={t('inventory.allCategories')}
                count={totalCount}
              />
            </DropdownMenuRadioItem>
          </div>
          {!hasResults && (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              {t('inventory.categorySearchEmpty')}
            </div>
          )}
          <CategoryTree
            nodes={filteredTree}
            isSearchActive={isSearchActive}
            expandLabel={t('orgManagement.categories.expandLabel')}
            collapseLabel={t('orgManagement.categories.collapseLabel')}
            renderRow={({ node, depth, leadingIcon }) => (
              <DropdownMenuRadioItem value={node.id} className="rounded-md">
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
              </DropdownMenuRadioItem>
            )}
          />
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
