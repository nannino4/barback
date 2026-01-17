/**
 * Application route paths
 * Centralized route definitions to avoid hardcoding paths throughout the codebase
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LANDING: '/',
  
  // Dashboard (protected)
  DASHBOARD: '/dashboard',

  // Organizations
  ORGS: {
    ROOT: '/orgs',
    CREATE: '/orgs/create',
    DETAIL: '/orgs/:orgId',
  },

  // Users
  USERS: {
    ME: '/users/me',
  },

  // Inventory
  INVENTORY: '/inventory',

  // Orders
  ORDERS: '/orders',
  
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
