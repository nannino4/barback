import { z } from 'zod';

// ============================================================================
// Zod Schemas - Single Source of Truth
// ============================================================================

/**
 * Payment method card details schema
 */
export const PaymentMethodCardResponseSchema = z.object({
  brand: z.string(), // visa, mastercard, amex, etc.
  last4: z.string().length(4),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int(),
});

/**
 * Payment method schema
 */
export const PaymentMethodResponseSchema = z.object({
  id: z.string(), // Stripe payment method ID
  type: z.string(), // 'card', etc.
  card: PaymentMethodCardResponseSchema.optional(),
  isDefault: z.boolean(),
});

/**
 * Add payment method request schema
 */
export const AddPaymentMethodRequestSchema = z.object({
  paymentMethodId: z.string(), // From Stripe.js
});

/**
 * Setup intent response schema - for POST /api/payment/setup-intent
 */
export const SetupIntentResponseSchema = z.object({
  clientSecret: z.string(),
});

// ============================================================================
// TypeScript Types - Derived from Zod Schemas
// ============================================================================

export type PaymentMethodCardResponse = z.infer<typeof PaymentMethodCardResponseSchema>;
export type PaymentMethodResponse = z.infer<typeof PaymentMethodResponseSchema>;
export type AddPaymentMethodRequest = z.infer<typeof AddPaymentMethodRequestSchema>;
export type SetupIntentResponse = z.infer<typeof SetupIntentResponseSchema>;
