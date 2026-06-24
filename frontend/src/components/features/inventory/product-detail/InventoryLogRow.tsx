import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Stack } from '@/components/layout';

import type { InventoryLogResponse } from '@/types/product';

interface InventoryLogRowProps
{
  log: InventoryLogResponse;
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  quantity: string;
  dateLabel: string;
}

export const InventoryLogRow: React.FC<InventoryLogRowProps> = ({
  log,
  label,
  variant,
  quantity,
  dateLabel,
}) =>
{
  return (
    <div className="rounded-lg border border-border p-3">
      <Stack space="xs">
        <Stack direction="horizontal" align="center" justify="between">
          <Badge variant={variant}>{label}</Badge>
          <span className="text-xs text-muted-foreground">
            {dateLabel}
          </span>
        </Stack>
        <Stack direction="horizontal" align="center" justify="between">
          <span className="text-sm font-semibold tabular-nums">
            {quantity}
          </span>
          <span className="text-xs text-muted-foreground">
            {log.previousQuantity} → {log.newQuantity}
          </span>
        </Stack>
        {log.note && (
          <span className="text-xs text-muted-foreground">
            {log.note}
          </span>
        )}
      </Stack>
    </div>
  );
};
