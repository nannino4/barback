import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  SubscriptionSchema,
  TrialEligibilityResponseSchema,
  SubscriptionSetupSchema,
  StripeSubscriptionStatusSchema,
  type Subscription,
  type TrialEligibilityResponse,
  type CreateSubscriptionRequest,
  type SubscriptionSetup,
  type StripeSubscriptionStatus,
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
   * 
   * Local subscription is created by webhook (`customer.subscription.created`) with initial
   * status INCOMPLETE. Organization can be created immediately after payment confirmation.
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

  /**
   * Poll subscription status by Stripe subscription ID
   */
  getStripeSubscriptionStatus: (stripeSubscriptionId: string): Promise<StripeSubscriptionStatus> =>
  {
    return apiClient.request<StripeSubscriptionStatus>(
      `/subscriptions/stripe/${stripeSubscriptionId}`,
      {
        method: 'GET',
      },
      StripeSubscriptionStatusSchema,
    );
  },
};
