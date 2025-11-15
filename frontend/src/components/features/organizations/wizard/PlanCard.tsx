import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Stack } from '@/components/layout';
import { cn } from '@/lib/utils';

interface PlanCardProps
{
  interval: 'MONTHLY' | 'YEARLY';
  title: string;
  pricePerPeriod: string;
  periodLabel: string;
  originalPrice?: string;
  originalPeriodLabel?: string;
  savingsPercent?: number;
  savingsText?: string;
  fullPriceText?: string;
  isHighlighted?: boolean;
  highlightBadgeText?: string;
  isSelected: boolean;
  onSelect: () => void;
  selectedText: string;
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
  title,
  pricePerPeriod,
  periodLabel,
  originalPrice,
  originalPeriodLabel,
  savingsPercent,
  savingsText,
  fullPriceText,
  isHighlighted,
  highlightBadgeText,
  isSelected,
  onSelect,
  selectedText,
}) =>
{
  return (
    <Card
      tabIndex={0}
      role="button"
      className={cn(
        'w-full cursor-pointer transition-all hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring',
        'relative border border-border bg-card',
        isSelected && 'border-primary/50 shadow-lg ring-2 ring-primary/20',
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
      {isHighlighted && highlightBadgeText && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {highlightBadgeText}
        </div>
      )}
      <CardContent className="pt-8 pb-6">
        <Stack space="md">
          <div>
            <h3 className="text-lg font-semibold">
              {title}
            </h3>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">
                  {pricePerPeriod}
                </p>
                <span className="text-sm text-muted-foreground">
                  /{periodLabel}
                </span>
              </div>
              {interval === 'YEARLY' && originalPrice && originalPeriodLabel && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    {originalPrice}/{originalPeriodLabel}
                  </span>
                </div>
              )}
              {savingsPercent && savingsText && (
                <p className="text-sm text-success font-medium mt-1">
                  {savingsText}
                </p>
              )}
              {interval === 'YEARLY' && fullPriceText && (
                <p className="text-xs text-muted-foreground mt-1">
                  {fullPriceText}
                </p>
              )}
            </div>
          </div>
          {isSelected && (
            <div className="flex items-center gap-2 text-primary">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">{selectedText}</span>
            </div>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
