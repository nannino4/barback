/**
 * Centralized error handling exports
 * 
 * Import from this file to access all error-related utilities
 */

// Error classes
export { ApiError, NetworkError, ValidationError } from './api-error';

// Error utilities
export { 
  getLocalizedErrorMessage, 
  isKnownError,
  formatValidationErrors,
} from './error-utils';

// Error handlers (for extension if needed)
export { AUTH_ERROR_HANDLERS } from './auth-errors';
export { COMMON_ERROR_HANDLERS, STATUS_CODE_HANDLERS } from './common-errors';

// Error codes and type guards
export { 
  isAuthErrorCode,
  isCommonErrorCode,
  type AuthErrorCode,
  type CommonErrorCode,
  type BackendErrorCode,
} from './error-codes';
