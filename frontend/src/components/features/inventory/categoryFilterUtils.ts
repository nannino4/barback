export interface CategoryTreeNode
{
  id: string;
  name: string;
  parentId?: string | null;
  children: CategoryTreeNode[];
}

export interface CategoryOption
{
  id: string;
  name: string;
  depth: number;
}

const sortByName = (a: { name: string }, b: { name: string }) =>
{
  return a.name.localeCompare(b.name);
};

export const buildCategoryTree = (categories: { id: string; name: string; parentId?: string | null }[]) =>
{
  const nodeMap = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  categories.forEach((category) =>
  {
    nodeMap.set(category.id, {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      children: [],
    });
  });

  nodeMap.forEach((node) =>
  {
    if (node.parentId && nodeMap.has(node.parentId))
    {
      nodeMap.get(node.parentId)!.children.push(node);
    }
    else
    {
      roots.push(node);
    }
  });

  const sortTree = (nodes: CategoryTreeNode[]) =>
  {
    nodes.sort(sortByName);
    nodes.forEach((child) => sortTree(child.children));
  };

  sortTree(roots);

  return roots;
};

export const flattenCategoryTree = (nodes: CategoryTreeNode[], depth = 0) =>
{
  const result: CategoryOption[] = [];

  nodes.forEach((node) =>
  {
    result.push({ id: node.id, name: node.name, depth });
    if (node.children.length > 0)
    {
      result.push(...flattenCategoryTree(node.children, depth + 1));
    }
  });

  return result;
};

export const filterCategoryTree = (nodes: CategoryTreeNode[], query: string) =>
{
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery)
  {
    return nodes;
  }

  const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null =>
  {
    const matchesSelf = node.name.toLowerCase().includes(normalizedQuery);
    const filteredChildren = node.children
      .map(filterNode)
      .filter((child): child is CategoryTreeNode => child !== null);

    if (matchesSelf)
    {
      return {
        ...node,
        children: node.children,
      };
    }

    if (filteredChildren.length > 0)
    {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  };

  return nodes
    .map(filterNode)
    .filter((node): node is CategoryTreeNode => node !== null);
};
