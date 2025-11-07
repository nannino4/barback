import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  SubscriptionSchema,
  TrialEligibilityResponseSchema,
  type Subscription,
  type TrialEligibilityResponse,
  type CreateSubscriptionRequest,
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
   * Create a new subscription (trial or paid)
   * @param data Subscription creation data (billingInterval, isTrial)
   * @returns The created subscription
   */
  createSubscription: (data: CreateSubscriptionRequest): Promise<Subscription> =>
  {
    return apiClient.request<Subscription>(
      '/subscriptions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      SubscriptionSchema,
    );
  },

  /**
   * Get all subscriptions for the current user
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
