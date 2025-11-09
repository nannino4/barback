import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import type { SubscriptionStatus } from '@/types/subscription';

interface SubscriptionStatusBadgeProps
{
  status: SubscriptionStatus;
  className?: string;
}

/**
 * SubscriptionStatusBadge - Display subscription status with appropriate styling
 * 
 * Visual hierarchy:
 * - Active/Trialing: Success colors (green)
 * - Past Due/Unpaid: Destructive colors (red)
 * - Canceled/Paused: Muted colors (gray)
 * - Incomplete: Warning colors (amber)
 */
export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  status,
  className,
}) =>
{
  const { t } = useI18n();

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' =>
  {
    switch (status)
    {
    case 'ACTIVE':
    case 'TRIALING':
      return 'default'; // Success/primary colors
    case 'PAST_DUE':
    case 'UNPAID':
      return 'destructive'; // Red/error colors
    case 'CANCELED':
    case 'PAUSED':
      return 'secondary'; // Muted/gray colors
    case 'INCOMPLETE':
    case 'INCOMPLETE_EXPIRED':
      return 'outline'; // Warning/amber colors
    default:
      return 'outline';
    }
  };

  const getStatusLabel = (): string =>
  {
    const statusKey = status.toLowerCase() as Lowercase<SubscriptionStatus>;
    return t(`subscription.status.${statusKey}`);
  };

  const getStatusColors = (): string =>
  {
    switch (status)
    {
    case 'ACTIVE':
      return 'bg-success/10 text-success border-success/20';
    case 'TRIALING':
      return 'bg-info/10 text-info border-info/20';
    case 'PAST_DUE':
    case 'UNPAID':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'CANCELED':
    case 'PAUSED':
      return 'bg-muted text-muted-foreground border-border';
    case 'INCOMPLETE':
    case 'INCOMPLETE_EXPIRED':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Badge
      variant={getStatusVariant()}
      className={cn(
        'font-medium',
        getStatusColors(),
        className,
      )}
    >
      {getStatusLabel()}
    </Badge>
  );
};
