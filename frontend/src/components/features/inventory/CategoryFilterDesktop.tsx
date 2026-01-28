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
import { cn } from '@/lib/utils';
import { filterCategoryTree } from '@/components/features/inventory/categoryFilterUtils';
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
          <DropdownMenuRadioItem value={ALL_CATEGORIES_VALUE}>
            <span className="flex items-center justify-between w-full">
              <span>{t('inventory.allCategories')}</span>
              <Badge variant="secondary" className="text-xs">
                {totalCount}
              </Badge>
            </span>
          </DropdownMenuRadioItem>
          {!hasResults && (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              {t('inventory.categorySearchEmpty')}
            </div>
          )}
          {filteredTree.map((parent) => (
            <div key={parent.id} className="px-2 pb-2">
              <div className="rounded-lg border border-border bg-background">
                <DropdownMenuRadioItem
                  value={parent.id}
                  className={cn('rounded-t-lg', parent.children.length === 0 && 'rounded-b-lg')}
                >
                  <span className="flex items-center justify-between w-full">
                    <span className="truncate font-medium">{parent.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getSubtreeCount(parent.id)}
                    </Badge>
                  </span>
                </DropdownMenuRadioItem>
                {parent.children.length > 0 && (
                  <div className="border-t border-border">
                    {parent.children.map((child) => (
                      <DropdownMenuRadioItem
                        key={child.id}
                        value={child.id}
                        className="pl-8"
                      >
                        <span className="flex items-center justify-between w-full">
                          <span className="truncate">{child.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getSubtreeCount(child.id)}
                          </Badge>
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
