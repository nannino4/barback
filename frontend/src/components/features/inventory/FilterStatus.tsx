import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';

interface FilterStatusProps
{
  showing: number;
  total: number;
  onClearFilters: () => void;
}

/**
 * Shows filter status when results are filtered
 */
export function FilterStatus({ showing, total, onClearFilters }: FilterStatusProps)
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
