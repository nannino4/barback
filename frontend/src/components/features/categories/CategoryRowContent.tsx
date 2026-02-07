import React from 'react';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoryRowContentProps
{
  name: string;
  count?: number;
  rightSlot?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  nameClassName?: string;
}

export const ParentCategoryRowContent: React.FC<CategoryRowContentProps> = ({
  name,
  count,
  rightSlot,
  leadingIcon,
  nameClassName,
}) =>
{
  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <span className="flex items-center gap-3 min-w-0">
        {leadingIcon ?? <Tag className="h-4 w-4 text-muted-foreground" />}
        <span className={cn('font-medium truncate', nameClassName)}>
          {name}
        </span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {typeof count === 'number' && (
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        )}
        {rightSlot}
      </span>
    </div>
  );
};

export const ChildCategoryRowContent: React.FC<CategoryRowContentProps> = ({
  name,
  count,
  rightSlot,
  leadingIcon,
  nameClassName,
}) =>
{
  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <span className="flex items-center gap-3 min-w-0">
        {leadingIcon ?? (
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        )}
        <span className={cn('truncate', nameClassName)}>
          {name}
        </span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {typeof count === 'number' && (
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        )}
        {rightSlot}
      </span>
    </div>
  );
};
