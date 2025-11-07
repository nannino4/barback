import { z } from 'zod';

// ============================================================================
// Zod Schemas - Single Source of Truth
// ============================================================================
// These schemas validate data received from the backend to ensure type safety
// and catch breaking API changes at runtime. TypeScript types are derived from
// these schemas using z.infer to maintain consistency.

/**
 * Subscription status enum - matches backend SubscriptionStatus enum
 */
export const SubscriptionStatusSchema = z.enum([
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'UNPAID',
  'INCOMPLETE',
  'INCOMPLETE_EXPIRED',
  'PAUSED',
]);

/**
 * Billing interval enum - for subscription plans
 */
export const BillingIntervalSchema = z.enum(['MONTHLY', 'YEARLY']);

/**
 * Subscription schema - validates subscription object structure from API
 */
export const SubscriptionSchema = z.object({
  id: z.string(),
  status: SubscriptionStatusSchema,
  autoRenew: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Trial eligibility response schema - for GET /api/subscriptions/trial-eligibility
 */
export const TrialEligibilityResponseSchema = z.object({
  eligible: z.boolean(),
});

/**
 * Create subscription request schema - for POST /api/subscriptions
 */
export const CreateSubscriptionRequestSchema = z.object({
  billingInterval: BillingIntervalSchema.optional().default('MONTHLY'),
  isTrial: z.boolean().optional().default(false),
});

// ============================================================================
// TypeScript Types - Derived from Zod Schemas
// ============================================================================

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type TrialEligibilityResponse = z.infer<typeof TrialEligibilityResponseSchema>;
export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>;
