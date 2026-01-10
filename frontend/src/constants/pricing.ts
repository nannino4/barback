import type { BillingInterval } from '@/types/subscription';

export type IntervalLabelKey =
  | 'organizations.create.planStep.interval.monthlyShort'
  | 'organizations.create.planStep.interval.yearlyShort';

export interface PricingPlan
{
  id: BillingInterval;
  interval: BillingInterval;
  price: number;
  currency: string;
  billingPeriodLabelKey: IntervalLabelKey;
  highlight?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'MONTHLY',
    interval: 'MONTHLY',
    price: 100,
    currency: 'EUR',
    billingPeriodLabelKey: 'organizations.create.planStep.interval.monthlyShort',
  },
  {
    id: 'YEARLY',
    interval: 'YEARLY',
    price: 1000,
    currency: 'EUR',
    billingPeriodLabelKey: 'organizations.create.planStep.interval.yearlyShort',
    highlight: true,
  },
];

export const PLAN_FEATURE_KEYS = [
  'organizations.create.planStep.features.inventoryTracking',
  'organizations.create.planStep.features.unlimitedProducts',
  'organizations.create.planStep.features.unlimitedMembers',
  'organizations.create.planStep.features.lowStockAlerts',
  'organizations.create.planStep.features.support',
] as const;

export type PlanFeatureKey = typeof PLAN_FEATURE_KEYS[number];
