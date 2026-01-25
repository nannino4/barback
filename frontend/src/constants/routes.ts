/**
 * Application route paths
 * Centralized route definitions to avoid hardcoding paths throughout the codebase
 * 
 * Navigation Architecture (MVP):
 * - Inventory is the primary workspace (default landing after auth)
 * - Bottom nav: Inventory, Alerts, More
 * - Top bar: Organization switcher (always visible)
 * - User menu: Account + preferences only
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LANDING: '/',

  // Organizations
  ORGS: {
    ROOT: '/orgs',
    CREATE: '/orgs/create',
    // Route patterns (for <Route path={...}>)
    DETAIL: '/orgs/:orgId',
    SETTINGS: '/orgs/:orgId/settings',
    // Typed builders (for navigation)
    detail: (orgId: string) => `/orgs/${orgId}` as const,
    settings: (orgId: string) => `/orgs/${orgId}/settings` as const,
    // Products within organization
    PRODUCTS: {
      // Route patterns
      ROOT: '/orgs/:orgId/products',
      DETAIL: '/orgs/:orgId/products/:productId',
      // Typed builders
      root: (orgId: string) => `/orgs/${orgId}/products` as const,
      detail: (orgId: string, productId: string) => `/orgs/${orgId}/products/${productId}` as const,
    },
  },

  // Users
  USERS: {
    ME: '/users/me',
  },

  // Core App Routes (require org context)
  // Inventory is the default landing page after authentication
  INVENTORY: '/inventory',
  
  // Alerts - low stock and critical items
  ALERTS: '/alerts',

  // More menu - accessible from bottom nav on mobile
  MORE: '/more',
  
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    SEND_VERIFICATION_EMAIL: '/auth/send-verification-email',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    FORGOT_PASSWORD_SENT: '/auth/forgot-password/sent',
    RESET_PASSWORD: '/auth/reset-password',
    RESET_PASSWORD_SUCCESS: '/auth/reset-password/success',
    RESET_PASSWORD_ERROR: '/auth/reset-password/error',
    GOOGLE_CALLBACK: '/auth/oauth/google/callback',
  },
  
  // Other
  DESIGN_SYSTEM: '/design-system',
  NOT_FOUND: '*',
} as const;
