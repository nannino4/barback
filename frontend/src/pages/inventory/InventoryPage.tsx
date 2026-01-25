import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageContainer, Stack } from '@/components/layout';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { ProductListSkeleton } from '@/components/features/inventory/ProductListSkeleton';
import { ProductList } from '@/components/features/inventory/ProductList';
import { CategoryFilterPlaceholder } from '@/components/features/inventory/CategoryFilterPlaceholder';
import { ROUTES } from '@/constants/routes';

import type { ProductResponse } from '@/types/product';

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

  // TODO: Replace with real data from useProducts hook (Checkpoint 4)
  const isLoading = false;
  const products = React.useMemo<ProductResponse[]>(() => [], []);
  const categories = React.useMemo<{ id: string; name: string }[]>(() => [], []);

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
      filtered = filtered.filter((product) =>
        product.categoryIds.includes(selectedCategoryId),
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
  }, [products, selectedCategoryId, searchQuery]);

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
            onProductClick={handleProductClick}
            onAdjustStock={handleAdjustStock}
          />
        )}
      </Stack>
    </PageContainer>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

interface InventoryHeaderProps
{
  productCount: number;
  onAddProduct: () => void;
  isLoading?: boolean;
}

/**
 * Header with title, product count, and Add Product button
 */
function InventoryHeader({
  productCount,
  onAddProduct,
  isLoading = false,
}: InventoryHeaderProps)
{
  const { t } = useI18n();

  return (
    <Stack direction="horizontal" space="sm" align="center" justify="between">
      <Stack direction="horizontal" space="sm" align="center">
        <h1 className="text-2xl font-bold">{t('inventory.title')}</h1>
        {!isLoading && productCount > 0 && (
          <span className="text-sm text-muted-foreground">
            ({productCount} {t('inventory.productCount', { count: productCount })})
          </span>
        )}
      </Stack>

      <Button onClick={onAddProduct} disabled={isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">{t('inventory.addProduct')}</span>
        <span className="sm:hidden">{t('common.add')}</span>
      </Button>
    </Stack>
  );
}

interface InventoryToolbarProps
{
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  categories: { id: string; name: string }[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  categoryProductCounts: Record<string, number>;
  isLoading?: boolean;
}

/**
 * Toolbar with search input and category filter
 */
function InventoryToolbar({
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
    <Stack direction="horizontal" space="sm" className="flex-wrap">
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
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
      <CategoryFilterPlaceholder
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={onCategoryChange}
        categoryProductCounts={categoryProductCounts}
        isLoading={isLoading}
      />
    </Stack>
  );
}

interface FilterStatusProps
{
  showing: number;
  total: number;
  onClearFilters: () => void;
}

/**
 * Shows filter status when results are filtered
 */
function FilterStatus({ showing, total, onClearFilters }: FilterStatusProps)
{
  const { t } = useI18n();

  return (
    <Stack direction="horizontal" space="sm" align="center" className="text-sm text-muted-foreground">
      <Filter className="h-4 w-4" />
      <span>
        {t('inventory.filterStatus', { showing, total })}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearFilters}
        className="h-auto p-0 text-primary hover:text-primary/80"
      >
        {t('inventory.clearFilters')}
      </Button>
    </Stack>
  );
}
