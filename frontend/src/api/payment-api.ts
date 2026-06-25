import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  PaymentMethodResponseSchema,
  SetupIntentResponseSchema,
  type PaymentMethodResponse,
  type AddPaymentMethodRequest,
  type SetupIntentResponse,
} from '@/types/payment';

// ============================================================================
// API Methods
// ============================================================================

export const paymentApi = {
  /**
   * Create a SetupIntent to collect and save a payment method.
   * @returns clientSecret to confirm with Stripe Elements
   */
  createSetupIntent: (): Promise<SetupIntentResponse> =>
  {
    return apiClient.request<SetupIntentResponse>(
      '/payment/setup-intent',
      {
        method: 'POST',
      },
      SetupIntentResponseSchema,
    );
  },

  /**
   * Get user's payment methods
   * @returns List of payment methods
   */
  getPaymentMethods: (): Promise<PaymentMethodResponse[]> =>
  {
    return apiClient.request<PaymentMethodResponse[]>(
      '/payment/methods',
      {
        method: 'GET',
      },
      z.array(PaymentMethodResponseSchema),
    );
  },

  /**
   * Add new payment method
   * @param data Payment method data (Stripe paymentMethodId)
   * @returns Created payment method
   */
  addPaymentMethod: (data: AddPaymentMethodRequest): Promise<PaymentMethodResponse> =>
  {
    return apiClient.request<PaymentMethodResponse>(
      '/payment/methods',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      PaymentMethodResponseSchema,
    );
  },

  /**
   * Remove payment method
   * @param paymentMethodId Payment method ID
   * @returns void
   */
  removePaymentMethod: (paymentMethodId: string): Promise<void> =>
  {
    return apiClient.request<void>(
      `/payment/methods/${paymentMethodId}`,
      {
        method: 'DELETE',
      },
    );
  },

  /**
   * Set default payment method
   * @param paymentMethodId Payment method ID
   * @returns void
   */
  setDefaultPaymentMethod: (paymentMethodId: string): Promise<void> =>
  {
    return apiClient.request<void>(
      '/payment/methods/default',
      {
        method: 'POST',
        body: JSON.stringify({ paymentMethodId }),
      },
    );
  },
};
