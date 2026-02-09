import { PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';

interface InventoryHeaderProps
{
  productCount: number;
  onAddProduct: () => void;
  isLoading?: boolean;
}

/**
 * Header with title, product count, and Add Product button
 */
export function InventoryHeader({
  productCount,
  onAddProduct,
  isLoading = false,
}: InventoryHeaderProps)
{
  const { t } = useI18n();

  return (
    <Stack direction="horizontal" space="sm" align="center" justify="between">
      <Stack direction="horizontal" space="sm" align="center">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {t('inventory.title')}
        </h1>
        {!isLoading && productCount > 0 && (
          <span className="text-sm text-muted-foreground">
            ({productCount} {t('inventory.productCount', { count: productCount })})
          </span>
        )}
      </Stack>

      <Button
        onClick={onAddProduct}
        disabled={isLoading}
        size="icon"
        className="h-touch w-touch"
        aria-label={t('inventory.addProduct')}
      >
        <PackagePlus className="h-4 w-4" />
      </Button>
    </Stack>
  );
}
