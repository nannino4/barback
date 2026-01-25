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
    DETAIL: '/orgs/:orgId',
    // Organization settings - accessible via org detail page (role-gated)
    SETTINGS: '/orgs/:orgId/settings',
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
