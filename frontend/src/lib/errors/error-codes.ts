/**
 * Type-safe error code definitions
 * 
 * These types ensure error codes are handled consistently and
 * prevent typos when checking error codes from the backend.
 */

/**
 * Authentication-specific error codes
 * Maps to backend auth module error codes
 */
export type AuthErrorCode =
  | 'EMAIL_ALREADY_VERIFIED'
  | 'INVALID_EMAIL_VERIFICATION_TOKEN'
  | 'USER_NOT_FOUND_BY_EMAIL'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_ACCESS_TOKEN'
  | 'INVALID_REFRESH_TOKEN'
  | 'INVALID_PASSWORD_RESET_TOKEN'
  | 'EMAIL_ALREADY_EXISTS'
  | 'WRONG_AUTH_PROVIDER'
  | 'PASSWORD_HASHING_FAILED'
  | 'TOKEN_GENERATION_FAILED'
  | 'DATABASE_OPERATION_FAILED';

/**
 * Common/system-level error codes
 * Maps to backend infrastructure and common errors
 */
export type CommonErrorCode =
  | 'RATE_LIMIT_EXCEEDED'
  | 'EMAIL_SERVICE_UNAVAILABLE'
  | 'INTERNAL_SERVER_ERROR';

/**
 * All possible error codes from backend
 */
export type BackendErrorCode = AuthErrorCode | CommonErrorCode;

/**
 * Type guard to check if error code is an auth error
 */
export const isAuthErrorCode = (code: string): code is AuthErrorCode =>
{
  const authCodes: AuthErrorCode[] = [
    'EMAIL_ALREADY_VERIFIED',
    'INVALID_EMAIL_VERIFICATION_TOKEN',
    'USER_NOT_FOUND_BY_EMAIL',
    'INVALID_CREDENTIALS',
    'INVALID_ACCESS_TOKEN',
    'INVALID_REFRESH_TOKEN',
    'INVALID_PASSWORD_RESET_TOKEN',
    'EMAIL_ALREADY_EXISTS',
    'WRONG_AUTH_PROVIDER',
    'PASSWORD_HASHING_FAILED',
    'TOKEN_GENERATION_FAILED',
    'DATABASE_OPERATION_FAILED',
  ];
  return authCodes.includes(code as AuthErrorCode);
};

/**
 * Type guard to check if error code is a common error
 */
export const isCommonErrorCode = (code: string): code is CommonErrorCode =>
{
  const commonCodes: CommonErrorCode[] = [
    'RATE_LIMIT_EXCEEDED',
    'EMAIL_SERVICE_UNAVAILABLE',
    'INTERNAL_SERVER_ERROR',
  ];
  return commonCodes.includes(code as CommonErrorCode);
};
