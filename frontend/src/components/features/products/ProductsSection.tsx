import React from 'react';
import { PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Section, Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductAdminRow } from '@/components/features/products/ProductAdminRow';
import { ProductFormSheet } from '@/components/features/products/ProductFormSheet';

import type { ProductResponse } from '@/types/product';

interface ProductsSectionProps
{
  orgId: string;
  canManage: boolean;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  orgId,
  canManage,
}) =>
{
  const { t } = useI18n();
  const skeletonRows = React.useMemo(() => ['p1', 'p2', 'p3', 'p4'], []);
  const {
    products,
    isLoading: isLoadingProducts,
    productsError,
    refetchProducts,
  } = useProducts({ orgId });
  const {
    categories,
    isLoading: isLoadingCategories,
  } = useCategories({ orgId });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<ProductResponse | null>(null);

  const isLoading = isLoadingProducts || isLoadingCategories;

  const filteredProducts = React.useMemo(() =>
  {
    if (!searchQuery.trim())
    {
      return products;
    }

    const query = searchQuery.toLowerCase();

    return products.filter((product) =>
      product.name.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  const handleAddProduct = () =>
  {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductResponse) =>
  {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <Section>
      <Card>
        <CardHeader>
          <Stack direction="horizontal" space="sm" align="center">
            <PackagePlus className="w-5 h-5 text-muted-foreground" />
            <CardTitle>
              {t('orgManagement.products.title')}{' '}
              <span className="text-muted-foreground font-normal">
                ({products.length})
              </span>
            </CardTitle>
          </Stack>
          <CardDescription>{t('orgManagement.products.description')}</CardDescription>
          {canManage && (
            <CardAction>
              <Button variant="outline" size="sm" onClick={handleAddProduct}>
                <PackagePlus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('orgManagement.products.addButton')}</span>
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent>
          <Stack space="md">
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('orgManagement.products.searchPlaceholder')}
              className="h-touch"
            />

            {productsError ? (
              <ErrorState
                title={t('orgManagement.products.errorTitle')}
                description={t('orgManagement.products.errorDescription')}
                onRetry={() => void refetchProducts()}
                retryLabel={t('common.tryAgain')}
              />
            ) : isLoading ? (
              <Stack space="sm">
                {skeletonRows.map((key) => (
                  <Skeleton key={key} className="h-20 w-full rounded-xl" />
                ))}
              </Stack>
            ) : filteredProducts.length > 0 ? (
              <Stack space="sm">
                {filteredProducts.map((product) => (
                  <ProductAdminRow
                    key={product.id}
                    product={product}
                    categories={categories}
                    canManage={canManage}
                    onEdit={() => handleEditProduct(product)}
                  />
                ))}
              </Stack>
            ) : (
              <Stack space="xs" className="text-center py-8">
                <span className="text-sm font-medium">
                  {t('orgManagement.products.emptyTitle')}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('orgManagement.products.emptyDescription')}
                </span>
                {canManage && (
                  <div className="mt-3">
                    <Button variant="outline" onClick={handleAddProduct}>
                      {t('orgManagement.products.addButton')}
                    </Button>
                  </div>
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      <ProductFormSheet
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={editingProduct ? 'edit' : 'create'}
        product={editingProduct}
        orgId={orgId}
      />
    </Section>
  );
};
