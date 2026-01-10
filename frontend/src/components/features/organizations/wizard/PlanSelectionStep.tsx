import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { formatCurrency } from '@/lib/formatters/formatCurrency';
import { PLAN_FEATURE_KEYS, PRICING_PLANS } from '@/constants/pricing';
import { PlanCard } from './PlanCard';
import type { BillingInterval } from '@/types/subscription';

interface PlanSelectionStepProps
{
  selectedInterval: BillingInterval;
  onSelectInterval: (interval: BillingInterval) => void;
  isTrial: boolean;
  onNext: () => void;
}

/**
 * PlanSelectionStep - Second step of organization creation wizard
 * 
 * Displays pricing plans with features and allows user to select billing interval
 */
export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  selectedInterval,
  onSelectInterval,
  isTrial,
  onNext,
}) =>
{
  const { t, currentLanguage } = useI18n();

  const trialDays = 90;

  // Calculate monthly equivalent price for yearly plan
  const monthlyPlan = PRICING_PLANS.find((plan) => plan.interval === 'MONTHLY');
  const yearlyPlan = PRICING_PLANS.find((plan) => plan.interval === 'YEARLY');

  const monthlyPriceValue = monthlyPlan?.price || 0;
  const yearlyPriceValue = yearlyPlan?.price || 0;
  const monthlyEquivalentForYearly = yearlyPriceValue / 12;
  const savingsPercent = monthlyPriceValue > 0
    ? Math.round(((monthlyPriceValue - monthlyEquivalentForYearly) / monthlyPriceValue) * 100)
    : 0;

  const planCards = useMemo(() =>
  {
    return PRICING_PLANS
      .slice()
      .sort((a, b) =>
      {
        if (a.interval === b.interval)
        {
          return 0;
        }

        return a.interval === 'YEARLY' ? -1 : 1;
      })
      .map((plan) =>
      {
        const formattedPrice = formatCurrency(plan.price, currentLanguage, plan.currency);
        const billingLabel = t(plan.billingPeriodLabelKey as never) as string;

        // Calculate additional display data
        let pricePerPeriod = formattedPrice;
        let originalPrice: string | undefined;
        let calculatedSavings: number | undefined;

        if (plan.interval === 'YEARLY')
        {
          // Show monthly equivalent for yearly plan
          pricePerPeriod = formatCurrency(monthlyEquivalentForYearly, currentLanguage, plan.currency);
          originalPrice = formatCurrency(monthlyPriceValue, currentLanguage, plan.currency);
          calculatedSavings = savingsPercent;
        }

        return {
          ...plan,
          formattedPrice,
          billingLabel,
          pricePerPeriod,
          originalPrice,
          calculatedSavings,
        };
      });
  }, [currentLanguage, t, monthlyEquivalentForYearly, monthlyPriceValue, savingsPercent]);

  const features = useMemo(
    () => PLAN_FEATURE_KEYS.map((key) => t(key as never) as string),
    [t],
  );

  return (
    <Stack space="lg">
      <div>
        <h2 className="text-2xl font-bold">
          {t('organizations.create.planStep.title')}
        </h2>
      </div>

      {/* Features List */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">
            {t('organizations.create.planStep.features.title')}
          </h3>
          <Stack space="sm">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Plan Selection */}
      <Stack space="md">
        {planCards.map((plan) =>
        {
          const isSelected = selectedInterval === plan.interval;

          const basePriceText = plan.interval === 'YEARLY'
            ? t('organizations.create.planStep.card.yearlyPrice' as never, {
              amount: plan.pricePerPeriod,
              yearlyAmount: plan.formattedPrice,
            }) as string
            : t('organizations.create.planStep.card.monthlyPrice' as never, {
              amount: plan.formattedPrice,
            }) as string;

          const priceLines = isTrial
            ? [
              t('organizations.create.planStep.card.freeTrialLine' as never, {
                days: trialDays,
              }) as string,
              t('organizations.create.planStep.card.thenLine' as never, {
                price: basePriceText,
              }) as string,
            ]
            : [basePriceText];

          const savingsText = plan.interval === 'YEARLY' && plan.calculatedSavings
            ? t('organizations.create.planStep.card.youSave' as never, {
              percent: plan.calculatedSavings,
            }) as string
            : undefined;

          return (
            <PlanCard
              key={plan.id}
              interval={plan.interval}
              billingPeriodLabel={plan.interval === 'YEARLY'
                ? t('organizations.create.planStep.yearly')
                : t('organizations.create.planStep.monthly')}
              badgeText={plan.interval === 'YEARLY'
                ? t('organizations.create.planStep.bestDeal')
                : undefined}
              priceLines={priceLines}
              savingsText={savingsText}
              isSelected={isSelected}
              onSelect={() => onSelectInterval(plan.interval)}
            />
          );
        })}
      </Stack>

      <Button type="button" className="w-full" onClick={onNext}>
        {t('common.continue')}
      </Button>
    </Stack>
  );
};
