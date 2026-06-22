import { z } from 'zod';
import { PaymentMethodResponseSchema } from '@/types/payment';

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
export const SubscriptionResponseSchema = z.object({
  id: z.string(),
  status: SubscriptionStatusSchema,
  autoRenew: z.boolean(),
  billingInterval: BillingIntervalSchema,
  nextBillingDate: z.string().datetime(),
  amount: z.number(),
  paymentMethod: PaymentMethodResponseSchema.optional(),
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
  billingInterval: BillingIntervalSchema.optional().default('YEARLY'),
  isTrial: z.boolean().optional().default(false),
});

/**
 * Trial activation response schema - for POST /api/subscriptions/trial
 * Frictionless trial: no payment collected, local subscription created immediately.
 */
export const TrialActivationResponseSchema = z.object({
  stripeSubscriptionId: z.string(),
  status: SubscriptionStatusSchema,
});

/**
 * Subscription setup response schema - for POST /api/subscriptions
 * Returns Stripe subscription ID and clientSecret for Payment Element
 * 
 * Note: Local subscription is NOT created yet - it will be created by webhook
 * after payment confirmation
 */
export const SubscriptionSetupResponseSchema = z.object({
  stripeSubscriptionId: z.string(),
  clientSecret: z.string(),
});

export const StripeSubscriptionStatusResponseSchema = z.object({
  stripeSubscriptionId: z.string(),
  status: SubscriptionStatusSchema,
});

export const SubscriptionResumePreviewResponseSchema = z.object({
  amountDue: z.number(),
  currency: z.string(),
  recurringAmount: z.number(),
  recurringCurrency: z.string(),
  billingInterval: BillingIntervalSchema,
  nextBillingDate: z.string().datetime(),
});

/**
 * Subscription status only schema - for non-owner members viewing subscription status
 * GET /api/orgs/:orgId/subscription/status
 */
export const SubscriptionStatusOnlyResponseSchema = z.object({
  status: SubscriptionStatusSchema,
});

// ============================================================================
// TypeScript Types - Derived from Zod Schemas
// ============================================================================

export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
export type TrialEligibilityResponse = z.infer<typeof TrialEligibilityResponseSchema>;
export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>;
export type SubscriptionSetupResponse = z.infer<typeof SubscriptionSetupResponseSchema>;
export type TrialActivationResponse = z.infer<typeof TrialActivationResponseSchema>;
export type StripeSubscriptionStatusResponse = z.infer<typeof StripeSubscriptionStatusResponseSchema>;
export type SubscriptionResumePreviewResponse = z.infer<typeof SubscriptionResumePreviewResponseSchema>;
export type SubscriptionStatusOnlyResponse = z.infer<typeof SubscriptionStatusOnlyResponseSchema>;
