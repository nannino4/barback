import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  SubscriptionResponseSchema,
  TrialEligibilityResponseSchema,
  SubscriptionSetupResponseSchema,
  StripeSubscriptionStatusResponseSchema,
  type SubscriptionResponse,
  type TrialEligibilityResponse,
  type CreateSubscriptionRequest,
  type SubscriptionSetupResponse,
  type StripeSubscriptionStatusResponse,
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
  setupSubscriptionPayment: (data: CreateSubscriptionRequest): Promise<SubscriptionSetupResponse> =>
  {
    return apiClient.request<SubscriptionSetupResponse>(
      '/subscriptions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      SubscriptionSetupResponseSchema,
    );
  },

  /**
   * Get all subscriptions for the current user
   * Only returns subscriptions that have been confirmed and saved to local database
   * @returns List of user's subscriptions
   */
  getSubscriptions: (): Promise<SubscriptionResponse[]> =>
  {
    return apiClient.request<SubscriptionResponse[]>(
      '/subscriptions',
      {
        method: 'GET',
      },
      z.array(SubscriptionResponseSchema),
    );
  },

  /**
   * Poll subscription status by Stripe subscription ID
   */
  getStripeSubscriptionStatus: (stripeSubscriptionId: string): Promise<StripeSubscriptionStatusResponse> =>
  {
    return apiClient.request<StripeSubscriptionStatusResponse>(
      `/subscriptions/stripe/${stripeSubscriptionId}`,
      {
        method: 'GET',
      },
      StripeSubscriptionStatusResponseSchema,
    );
  },
};
