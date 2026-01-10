import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stack } from '@/components/layout';
import { cn } from '@/lib/utils';

interface PlanCardProps
{
  interval: 'MONTHLY' | 'YEARLY';
  billingPeriodLabel: string;
  badgeText?: string;
  priceLines: string[];
  savingsText?: string;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * PlanCard - Individual pricing plan card component
 * 
 * Displays a pricing plan with:
 * - Price and billing period
 * - Optional crossed-out original price (for discounts)
 * - Optional savings badge
 * - Selection state
 * - Optional highlight badge
 */
export const PlanCard: React.FC<PlanCardProps> = ({
  interval,
  billingPeriodLabel,
  badgeText,
  priceLines,
  savingsText,
  isSelected,
  onSelect,
}) =>
{
  const trialBadgeText = priceLines.length > 1 ? priceLines[0] : null;
  const displayPriceLines = priceLines.length > 1 ? priceLines.slice(1) : priceLines;

  return (
    <Card
      variant={isSelected ? 'primary' : 'bordered'}
      tabIndex={0}
      role="button"
      className={cn(
        'w-full cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
      )}
      onClick={onSelect}
      onKeyDown={(event) =>
      {
        if (event.key === 'Enter' || event.key === ' ')
        {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <Stack space="xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-base font-semibold truncate">
              {billingPeriodLabel}
            </p>
          </div>

          {interval === 'YEARLY' && badgeText && (
            <Badge>
              {badgeText}
            </Badge>
          )}
        </div>

        <Stack space="xs">
          {trialBadgeText && (
            <div>
              <Badge>
                {trialBadgeText}
              </Badge>
            </div>
          )}

          {displayPriceLines.map((line) => (
            <p key={line} className="text-sm text-muted-foreground">
              {line}
            </p>
          ))}

          {interval === 'YEARLY' && savingsText && (
            <p className="text-xs text-success">
              {savingsText}
            </p>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
