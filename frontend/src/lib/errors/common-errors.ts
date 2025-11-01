import type { CommonErrorCode } from './error-codes';

/**
 * Common Error Code Mappings
 * 
 * Maps common/system-level error codes to localized translation keys
 * Includes rate limiting, email service errors, etc.
 */

type ErrorCodeHandler = (t: (key: string) => string) => string;

/**
 * Common error code handlers
 * These handle system-level and infrastructure errors
 */
export const COMMON_ERROR_HANDLERS: Record<CommonErrorCode, ErrorCodeHandler> = {
  // Rate limiting
  RATE_LIMIT_EXCEEDED: (t) => t('errors.rateLimitExceeded'),
  
  // Email service errors (all mapped to same user-friendly message)
  EMAIL_SERVICE_UNAVAILABLE: (t) => t('errors.emailServiceUnavailable'),
  EMAIL_SENDING_FAILED: (t) => t('errors.emailServiceUnavailable'),
  EMAIL_CONFIGURATION_ERROR: (t) => t('errors.emailServiceUnavailable'),
  
  // Server errors
  INTERNAL_SERVER_ERROR: (t) => t('errors.serverError'),
};

/**
 * HTTP Status Code handlers
 * Maps status codes to generic error messages
 * These are checked AFTER specific error codes for fallback
 */
export const STATUS_CODE_HANDLERS: Record<number, ErrorCodeHandler> = {
  0: (t) => t('errors.networkError'),
  400: (t) => t('errors.badRequest'),
  401: (t) => t('errors.unauthorized'),
  403: (t) => t('errors.forbidden'),
  404: (t) => t('errors.notFoundError'),
  429: (t) => t('errors.rateLimitExceeded'),
  500: (t) => t('errors.serverError'),
  503: (t) => t('errors.serviceUnavailable'),
};
