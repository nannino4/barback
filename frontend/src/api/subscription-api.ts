import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  SubscriptionSchema,
  TrialEligibilityResponseSchema,
  SubscriptionSetupSchema,
  type Subscription,
  type TrialEligibilityResponse,
  type CreateSubscriptionRequest,
  type SubscriptionSetup,
} from '@/types/subscription';

// ============================================================================
// API Methods
// ============================================================================

export const subscriptionApi = {
  /**
   * Check if the current user is eligible for a trial subscription
   * @returns Trial eligibility status
   */
  checkTrialEligibility: (): Promise<TrialEligibilityResponse> =>
  {
    return apiClient.request<TrialEligibilityResponse>(
      '/subscriptions/trial-eligibility',
      {
        method: 'GET',
      },
      TrialEligibilityResponseSchema,
    );
  },

  /**
   * Setup subscription for payment collection
   * Creates a Stripe subscription and returns clientSecret for Payment Element
   * Does NOT save to local database yet - subscription will be created by webhook after payment
   * 
   * @param data Subscription creation data (billingInterval, isTrial)
   * @returns Stripe subscription ID and clientSecret for Payment Element
   */
  setupSubscriptionPayment: (data: CreateSubscriptionRequest): Promise<SubscriptionSetup> =>
  {
    return apiClient.request<SubscriptionSetup>(
      '/subscriptions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      SubscriptionSetupSchema,
    );
  },

  /**
   * Get all subscriptions for the current user
   * Only returns subscriptions that have been confirmed and saved to local database
   * @returns List of user's subscriptions
   */
  getSubscriptions: (): Promise<Subscription[]> =>
  {
    return apiClient.request<Subscription[]>(
      '/subscriptions',
      {
        method: 'GET',
      },
      z.array(SubscriptionSchema),
    );
  },
};
