import type { BillingInterval } from '@/types/subscription';

export type IntervalLabelKey =
  | 'organizations.create.planStep.interval.yearlyShort';

export interface PricingPlan
{
  id: BillingInterval;
  interval: BillingInterval;
  price: number;
  currency: string;
  billingPeriodLabelKey: IntervalLabelKey;
}

/**
 * The single plan offered (yearly). Barback is B2B and only sells an annual plan.
 */
export const YEARLY_PLAN: PricingPlan = {
  id: 'YEARLY',
  interval: 'YEARLY',
  price: 1000,
  currency: 'EUR',
  billingPeriodLabelKey: 'organizations.create.planStep.interval.yearlyShort',
};

/** Length of the free trial, in days. Mirrors the backend default. */
export const TRIAL_DAYS = 90;

export const PLAN_FEATURE_KEYS = [
  'organizations.create.planStep.features.inventoryTracking',
  'organizations.create.planStep.features.unlimitedProducts',
  'organizations.create.planStep.features.unlimitedMembers',
  'organizations.create.planStep.features.lowStockAlerts',
  'organizations.create.planStep.features.support',
] as const;

export type PlanFeatureKey = typeof PLAN_FEATURE_KEYS[number];
