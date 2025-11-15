import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters/formatCurrency';
import { PLAN_FEATURE_KEYS, PRICING_PLANS } from '@/constants/pricing';
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

  const planCards = useMemo(() =>
  {
    return PRICING_PLANS.map((plan) =>
    {
      const formattedPrice = formatCurrency(plan.price, currentLanguage, plan.currency);
      const billingLabel = t(plan.billingPeriodLabelKey as never) as string;

      return {
        ...plan,
        formattedPrice,
        billingLabel,
      };
    });
  }, [currentLanguage, t]);

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
      <Stack direction="horizontal" space="md" className="flex-wrap">
        {planCards.map((plan) =>
        {
          const isSelected = selectedInterval === plan.interval;

          return (
            <Card
              key={plan.id}
              tabIndex={0}
              role="button"
              className={cn(
                'flex-1 min-w-[260px] cursor-pointer transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                'relative border border-border bg-card',
                isSelected && 'border-primary/50 shadow-lg ring-2 ring-primary/20',
              )}
              onClick={() => onSelectInterval(plan.interval)}
              onKeyDown={(event) =>
              {
                if (event.key === 'Enter' || event.key === ' ')
                {
                  event.preventDefault();
                  onSelectInterval(plan.interval);
                }
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {t('organizations.create.planStep.bestValue')}
                </div>
              )}
              <CardContent className="pt-8">
                <Stack space="md">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {plan.interval === 'MONTHLY'
                        ? t('organizations.create.planStep.monthly')
                        : t('organizations.create.planStep.yearly')}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <p className="text-3xl font-bold">
                        {plan.formattedPrice}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        /{plan.billingLabel}
                      </span>
                    </div>
                    {plan.savingsPercentage && (
                      <p className="text-sm text-success font-medium mt-1">
                        {t('organizations.create.planStep.savings' as never, {
                          percent: plan.savingsPercentage,
                        }) as string}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">{t('common.selected')}</span>
                    </div>
                  )}
                </Stack>
              </CardContent>
            </Card>
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
