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
  onBack: () => void;
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
  onBack,
}) =>
{
  const { t, currentLanguage } = useI18n();

  // Calculate monthly equivalent price for yearly plan
  const monthlyPlan = PRICING_PLANS.find((plan) => plan.interval === 'MONTHLY');
  const yearlyPlan = PRICING_PLANS.find((plan) => plan.interval === 'YEARLY');

  const monthlyPriceValue = monthlyPlan?.price || 0;
  const yearlyPriceValue = yearlyPlan?.price || 0;
  const monthlyEquivalentForYearly = yearlyPriceValue / 12;
  const savingsPercent = Math.round(((monthlyPriceValue - monthlyEquivalentForYearly) / monthlyPriceValue) * 100);

  const planCards = useMemo(() =>
  {
    return PRICING_PLANS.map((plan) =>
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
        <p className="text-muted-foreground mt-2">
          {t('organizations.create.planStep.description')}
        </p>
      </div>

      {/* Trial Badge */}
      {isTrial && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-primary">
                  {t('subscription.trial.eligible')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('subscription.trial.description')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Selection */}
      <Stack space="md">
        {planCards.map((plan) =>
        {
          const isSelected = selectedInterval === plan.interval;

          // Build full price text for yearly plan
          const fullPriceText = plan.interval === 'YEARLY' && plan.formattedPrice && plan.pricePerPeriod
            ? [
              plan.formattedPrice,
              '/',
              t(plan.billingPeriodLabelKey as never) as string,
              ' ',
              t('common.or'),
              ' ',
              plan.pricePerPeriod,
              '/',
              t('organizations.create.planStep.interval.monthlyShort'),
            ].join('')
            : undefined;

          return (
            <PlanCard
              key={plan.id}
              interval={plan.interval}
              title={plan.interval === 'MONTHLY'
                ? t('organizations.create.planStep.monthly')
                : t('organizations.create.planStep.yearly')}
              pricePerPeriod={plan.interval === 'YEARLY' ? plan.pricePerPeriod : plan.formattedPrice}
              periodLabel={plan.interval === 'YEARLY'
                ? t('organizations.create.planStep.interval.monthlyShort')
                : t(plan.billingPeriodLabelKey as never)}
              originalPrice={plan.originalPrice}
              originalPeriodLabel={plan.originalPrice
                ? t('organizations.create.planStep.interval.monthlyShort')
                : undefined}
              savingsPercent={plan.calculatedSavings}
              savingsText={plan.calculatedSavings
                ? t('organizations.create.planStep.savings' as never, {
                  percent: plan.calculatedSavings,
                }) as string
                : undefined}
              fullPriceText={fullPriceText}
              isHighlighted={plan.highlight}
              highlightBadgeText={plan.highlight
                ? t('organizations.create.planStep.bestValue')
                : undefined}
              isSelected={isSelected}
              onSelect={() => onSelectInterval(plan.interval)}
              selectedText={t('common.selected')}
            />
          );
        })}
      </Stack>

      {/* Features List */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-4">
            {t('organizations.create.planStep.features.title')}
          </h4>
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

      {/* Actions */}
      <Stack direction="horizontal" space="md" className="justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button type="button" onClick={onNext}>
          {t('common.continue')}
        </Button>
      </Stack>
    </Stack>
  );
};
