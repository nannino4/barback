import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import { PageContainer, Stack } from '@/components/layout';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import {
  ProductListSkeleton,
  ProductList,
  InventoryHeader,
  InventoryToolbar,
  FilterStatus,
} from '@/components/features/inventory';
import { ROUTES } from '@/constants/routes';

/**
 * InventoryPage - Main operative view for inventory management
 * 
 * Features:
 * - Product list with search and category filter
 * - Add Product button above the list
 * - One-click stock adjustment access
 * - Client-side filtering (all products loaded at once)
 */
export function InventoryPage()
{
  const { t } = useI18n();
  const navigate = useNavigate();
  const { currentOrg } = useOrganizations();

  // UI state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

  // Fetch products and categories from API
  const { products, isLoading: isLoadingProducts } = useProducts();
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const isLoading = isLoadingProducts || isLoadingCategories;

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

  const getCategoryAndDescendants = React.useCallback((categoryId: string) =>
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
      const children = categoryChildrenMap[currentId] || [];
      children.forEach((childId) => stack.push(childId));
    }

    return ids;
  }, [categoryChildrenMap]);

  // ==========================================================================
  // Computed Values
  // ==========================================================================

  /**
   * Filter products based on search query and selected category
   * Client-side filtering for instant results
   */
  const filteredProducts = React.useMemo(() =>
  {
    let filtered = products;

    // Filter by category
    if (selectedCategoryId)
    {
      const categoryIds = getCategoryAndDescendants(selectedCategoryId);
      filtered = filtered.filter((product) =>
        product.categoryIds.some((categoryId) => categoryIds.has(categoryId)),
      );
    }

    // Filter by search query (name and brand)
    if (searchQuery.trim())
    {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [products, selectedCategoryId, searchQuery, getCategoryAndDescendants]);

  /**
   * Calculate product counts per category (for filter badges)
   */
  const categoryProductCounts = React.useMemo(() =>
  {
    const counts: Record<string, number> = {};
    products.forEach((product) =>
    {
      product.categoryIds.forEach((categoryId) =>
      {
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      });
    });
    return counts;
  }, [products]);

  const hasFilters = searchQuery.trim() !== '' || selectedCategoryId !== null;
  const showingFilteredResults = hasFilters && filteredProducts.length !== products.length;

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () =>
  {
    setSearchQuery('');
  };

  const handleCategoryChange = (categoryId: string | null) =>
  {
    setSelectedCategoryId(categoryId);
  };

  const handleClearFilters = () =>
  {
    setSearchQuery('');
    setSelectedCategoryId(null);
  };

  const handleAddProduct = () =>
  {
    // TODO: Navigate to product creation or open sheet (Checkpoint 7)
    console.log('Add product clicked');
  };

  const handleAdjustStock = (productId: string) =>
  {
    // TODO: Open stock adjustment sheet (Checkpoint 6)
    console.log('Adjust stock for product:', productId);
  };

  const handleProductClick = (productId: string) =>
  {
    // Navigate to product details
    if (currentOrg)
    {
      void navigate(ROUTES.ORGS.PRODUCTS.detail(currentOrg.org.id, productId));
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  // Loading state
  if (isLoading)
  {
    return (
      <PageContainer>
        <Stack space="md">
          {/* Header skeleton */}
          <InventoryHeader
            productCount={0}
            onAddProduct={handleAddProduct}
            isLoading
          />

          {/* Toolbar skeleton */}
          <InventoryToolbar
            searchQuery=""
            onSearchChange={() => {}}
            onClearSearch={() => {}}
            categories={[]}
            selectedCategoryId={null}
            onCategoryChange={() => {}}
            categoryProductCounts={{}}
            isLoading
          />

          {/* Product list skeleton */}
          <ProductListSkeleton count={6} />
        </Stack>
      </PageContainer>
    );
  }

  // Empty state (no products at all)
  if (products.length === 0)
  {
    return (
      <PageContainer>
        <Stack space="md">
          {/* Header */}
          <InventoryHeader
            productCount={0}
            onAddProduct={handleAddProduct}
          />

          {/* Empty state */}
          <EmptyState
            icon={Package}
            title={t('inventory.empty.title')}
            description={t('inventory.empty.description')}
            action={{
              label: t('inventory.addProduct'),
              onClick: handleAddProduct,
            }}
          />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack space="md">
        {/* Header with title, count, and add button */}
        <InventoryHeader
          productCount={products.length}
          onAddProduct={handleAddProduct}
        />

        {/* Toolbar with search and filters */}
        <InventoryToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleCategoryChange}
          categoryProductCounts={categoryProductCounts}
        />

        {/* Filter status */}
        {showingFilteredResults && (
          <FilterStatus
            showing={filteredProducts.length}
            total={products.length}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Product list or empty search results */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('inventory.noResults.title')}
            description={t('inventory.noResults.description')}
            action={{
              label: t('inventory.clearFilters'),
              onClick: handleClearFilters,
              variant: 'outline',
            }}
          />
        ) : (
          <ProductList
            products={filteredProducts}
            categories={categories}
            onProductClick={handleProductClick}
            onAdjustStock={handleAdjustStock}
          />
        )}
      </Stack>
    </PageContainer>
  );
}

