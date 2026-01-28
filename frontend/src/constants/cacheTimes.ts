/**
 * Centralized TanStack Query cache time constants
 * 
 * These values control how long query data is considered fresh (staleTime).
 * After staleTime expires, queries will refetch on next mount/usage.
 * 
 * Benefits:
 * - Consistent cache behavior across the app
 * - Easy to tune performance
 * - Single source of truth
 * - Self-documenting with explanations
 * 
 * Guidelines:
 * - Frequently changing data → shorter staleTime (1-2 minutes)
 * - Semi-static data → medium staleTime (5 minutes)
 * - Rarely changing data → longer staleTime (10-15 minutes)
 * - Never changing data → Infinity (but be careful!)
 * 
 * Usage:
 * ```tsx
 * useQuery({
 *   queryKey: queryKeys.organizations.all,
 *   queryFn: () => organizationApi.getOrganizations(),
 *   staleTime: CACHE_TIMES.ORGANIZATIONS,
 * })
 * ```
 */

const MINUTE = 60 * 1000; // 60,000ms = 1 minute

export const CACHE_TIMES = {
  /**
   * Organizations list - 5 minutes
   * Users don't create/delete organizations frequently
   */
  ORGANIZATIONS: 5 * MINUTE,

  /**
   * Organization members - 5 minutes
   * Member list changes infrequently (only when adding/removing members)
   */
  ORGANIZATION_MEMBERS: 5 * MINUTE,

  /**
   * Invitations - 2 minutes
   * More time-sensitive as they have expiry and users may accept/decline
   */
  INVITATIONS: 2 * MINUTE,

  /**
   * Subscriptions - 5 minutes
   * Subscription status changes infrequently
   */
  SUBSCRIPTIONS: 5 * MINUTE,

  /**
   * Trial eligibility - Cache for entire session
   * This value never changes during a session
   */
  TRIAL_ELIGIBILITY: Infinity,

  /**
   * Products - 2 minutes
   * Products can change frequently due to stock adjustments
   */
  PRODUCTS: 2 * MINUTE,

  /**
   * Categories - 5 minutes
   * Categories change infrequently
   */
  CATEGORIES: 5 * MINUTE,
} as const;
