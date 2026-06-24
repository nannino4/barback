import React from 'react';
import { ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryTreeNode } from '@/components/features/inventory/categoryFilterUtils';

interface CategoryTreeRenderProps
{
  node: CategoryTreeNode;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  leadingIcon: React.ReactNode;
  toggleExpand: (event: React.MouseEvent) => void;
}

interface CategoryTreeProps
{
  nodes: CategoryTreeNode[];
  renderRow: (props: CategoryTreeRenderProps) => React.ReactNode;
  expandLabel: string;
  collapseLabel: string;
  isSearchActive?: boolean;
  expandedIds?: Set<string>;
  onExpandedIdsChange?: (next: Set<string>) => void;
  className?: string;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  nodes,
  renderRow,
  expandLabel,
  collapseLabel,
  isSearchActive = false,
  expandedIds,
  onExpandedIdsChange,
  className,
}) =>
{
  const [internalExpandedIds, setInternalExpandedIds] = React.useState<Set<string>>(new Set());
  const activeExpandedIds = expandedIds ?? internalExpandedIds;

  const setExpandedIds = React.useCallback((next: Set<string>) =>
  {
    if (onExpandedIdsChange)
    {
      onExpandedIdsChange(next);
      return;
    }

    setInternalExpandedIds(next);
  }, [onExpandedIdsChange]);

  const handleToggleExpand = React.useCallback((event: React.MouseEvent, categoryId: string) =>
  {
    event.preventDefault();
    event.stopPropagation();

    const next = new Set(activeExpandedIds);
    if (next.has(categoryId))
    {
      next.delete(categoryId);
    }
    else
    {
      next.add(categoryId);
    }
    setExpandedIds(next);
  }, [activeExpandedIds, setExpandedIds]);

  const renderLeadingIcon = (
    node: CategoryTreeNode,
    depth: number,
    hasChildren: boolean,
    isExpanded: boolean,
  ) =>
  {
    const chevron = hasChildren ? (
      <button
        type="button"
        onClick={(event) => handleToggleExpand(event, node.id)}
        className="flex items-center justify-center h-4 w-4 text-muted-foreground"
        aria-label={isExpanded ? collapseLabel : expandLabel}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    ) : (
      <span className="h-4 w-4" />
    );

    return (
      <span className="flex items-center gap-2">
        {chevron}
        {depth === 0 ? (
          <Tag className="h-4 w-4 text-muted-foreground" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        )}
      </span>
    );
  };

  const renderNode = (node: CategoryTreeNode, depth: number): React.ReactNode =>
  {
    const hasChildren = node.children.length > 0;
    const isExpanded = isSearchActive || activeExpandedIds.has(node.id);
    const leadingIcon = renderLeadingIcon(node, depth, hasChildren, isExpanded);

    return (
      <div key={node.id} className="space-y-1">
        {renderRow({
          node,
          depth,
          hasChildren,
          isExpanded,
          leadingIcon,
          toggleExpand: (event) => handleToggleExpand(event, node.id),
        })}
        {hasChildren && isExpanded && (
          <div className="relative pl-2">
            <span className="absolute left-0 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-1">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-1', className)}>
      {nodes.map((node) => renderNode(node, 0))}
    </div>
  );
};
