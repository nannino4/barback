import type { OrgRole } from '@/types/organization';

/**
 * Centralized TanStack Query keys for consistent cache management
 * 
 * Benefits:
 * - Type-safe query keys
 * - Single source of truth
 * - Easy to refactor
 * - Prevents typos
 * - Better autocomplete
 * 
 * Usage:
 * ```tsx
 * useQuery({
 *   queryKey: queryKeys.organizations.all,
 *   queryFn: () => organizationApi.getOrganizations(),
 * })
 * ```
 */
export const queryKeys = {
  /** User-related queries */
  users: {
    /** Current authenticated user */
    me: ['user', 'me'] as const,
  },

  /**
   * Organization-related queries
   */
  organizations: {
    /** All organizations for the current user */
    all: ['organizations'] as const,
    
    /** Organizations filtered by role */
    byRole: (role: OrgRole) => ['organizations', role] as const,
    
    /** Single organization by ID */
    detail: (orgId: string) => ['organization', orgId] as const,
    
    /** Organization members */
    members: (orgId: string) => ['organization', orgId, 'members'] as const,
    
    /** Organization subscription (full details - owner only) */
    subscription: (orgId: string) => ['organization', orgId, 'subscription'] as const,
    
    /** Organization subscription status (all members) */
    subscriptionStatus: (orgId: string) => ['organization', orgId, 'subscription-status'] as const,
    
    /** Organization invitations (pending) */
    invitations: (orgId: string) => ['organization', orgId, 'invitations'] as const,
  },

  /**
   * Invitation-related queries
   */
  invitations: {
    /** All pending invitations for current user */
    pending: ['invitations'] as const,
  },

  /**
   * Subscription-related queries
   */
  subscriptions: {
    /** All subscriptions for current user */
    all: ['subscriptions'] as const,
    
    /** Trial eligibility check */
    trialEligibility: ['trial-eligibility'] as const,
  },

  /**
   * Product-related queries
   */
  products: {
    /** All products for an organization */
    all: (orgId: string) => ['products', orgId] as const,
    
    /** Single product by ID */
    detail: (orgId: string, productId: string) => ['products', orgId, productId] as const,
  },

  /**
   * Category-related queries
   */
  categories: {
    /** All categories for an organization */
    all: (orgId: string) => ['categories', orgId] as const,
    
    /** Single category by ID */
    detail: (orgId: string, categoryId: string) => ['categories', orgId, categoryId] as const,
  },
} as const;
