import React from 'react';
import { Check, ChevronDown, Search, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Stack } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { filterCategoryTree } from '@/components/features/inventory/categoryFilterUtils';
import { useI18n } from '@/hooks/useI18n';

import type { CategoryTreeNode } from '@/components/features/inventory/categoryFilterUtils';

interface CategoryFilterMobileProps
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

export const CategoryFilterMobile: React.FC<CategoryFilterMobileProps> = ({
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
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
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

  const handleSelect = (value: string) =>
  {
    onSelectValue(value);
    setIsSheetOpen(false);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>{t('inventory.categoryFilterTitle')}</SheetTitle>
          <SheetDescription>{t('inventory.categoryFilterDescription')}</SheetDescription>
        </SheetHeader>
        <Stack space="sm" className="mt-4">
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
          <button
            type="button"
            onClick={() => handleSelect(ALL_CATEGORIES_VALUE)}
            className={cn(
              'w-full rounded-lg border border-border px-3 py-3 text-left',
              'flex items-center justify-between gap-3',
              selectedCategoryId === null ? 'bg-muted' : 'bg-background',
            )}
          >
            <span className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{t('inventory.allCategories')}</span>
            </span>
            <span className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {totalCount}
              </Badge>
              {selectedCategoryId === null && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </span>
          </button>

          {!hasResults && (
            <div className="rounded-lg border border-border bg-background px-3 py-3 text-sm text-muted-foreground">
              {t('inventory.categorySearchEmpty')}
            </div>
          )}

          {filteredTree.map((parent) => (
            <div
              key={parent.id}
              className="rounded-xl border border-border bg-background overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handleSelect(parent.id)}
                className={cn(
                  'w-full px-3 py-3 text-left',
                  'flex items-center justify-between gap-3',
                  selectedCategoryId === parent.id ? 'bg-muted' : 'bg-background',
                  parent.children.length > 0 ? 'border-b border-border' : 'rounded-xl',
                )}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium truncate">{parent.name}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getSubtreeCount(parent.id)}
                  </Badge>
                  {selectedCategoryId === parent.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </span>
              </button>

              {parent.children.length > 0 && (
                <div>
                  {parent.children.map((child, index) =>
                  {
                    const isSelected = selectedCategoryId === child.id;
                    const isLastChild = index === parent.children.length - 1;
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleSelect(child.id)}
                        className={cn(
                          'w-full px-4 py-3 text-left',
                          'flex items-center justify-between gap-3',
                          isSelected ? 'bg-muted' : 'bg-background',
                          isLastChild && 'rounded-b-xl',
                          !isLastChild && 'border-b border-border',
                        )}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                          <span className="truncate">{child.name}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {getSubtreeCount(child.id)}
                          </Badge>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </Stack>
      </SheetContent>
    </Sheet>
  );
};
