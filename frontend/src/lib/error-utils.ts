import type { ApiError } from '@/types/api';

/**
 * Parses an Error object to extract ApiError information
 * The API client throws errors with JSON.stringify, so we need to parse them
 */
export const parseApiError = (error: Error): ApiError =>
{
  try
  {
    return JSON.parse(error.message) as ApiError;
  }
  catch
  {
    // Fallback for non-API errors (network errors, etc.)
    return {
      message: error.message,
      statusCode: 0,
    };
  }
};

/**
 * Type for error code handler function
 */
type ErrorCodeHandler = (t: (key: string) => string) => string;

/**
 * Registry of error code handlers
 * Maps backend error codes to translation key resolvers
 * 
 * To add new error codes:
 * 1. Add the error code to this registry with its translation key
 * 2. Add the translation key to your locale files
 * 
 * This follows the Open-Closed Principle: open for extension, closed for modification
 */
const ERROR_CODE_HANDLERS: Record<string, ErrorCodeHandler> = {
  // Email verification errors
  EMAIL_ALREADY_VERIFIED: (t) => t('auth.errors.emailAlreadyVerified'),
  INVALID_EMAIL_VERIFICATION_TOKEN: (t) => t('auth.errors.invalidOrExpiredToken'),
  
  // User errors
  USER_NOT_FOUND_BY_EMAIL: (t) => t('auth.errors.userNotFound'),
  
  // Email service errors
  EMAIL_SENDING_FAILED: (t) => t('auth.errors.emailSendingFailed'),
  EMAIL_CONFIGURATION_ERROR: (t) => t('auth.errors.emailConfigError'),
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: (t) => t('errors.rateLimitExceeded'),
  
  // Authentication errors
  INVALID_CREDENTIALS: (t) => t('auth.errors.invalidCredentials'),
  INVALID_ACCESS_TOKEN: (t) => t('errors.unauthorized'),
  INVALID_REFRESH_TOKEN: (t) => t('errors.sessionExpired'),
  
  // Password reset errors
  INVALID_PASSWORD_RESET_TOKEN: (t) => t('auth.errors.invalidOrExpiredToken'),
  
  // Registration errors
  EMAIL_ALREADY_EXISTS: (t) => t('auth.errors.emailAlreadyExists'),
  
  // Authorization errors  
  WRONG_AUTH_PROVIDER: (t) => t('auth.errors.wrongAuthProvider'),
};

/**
 * Registry of HTTP status code handlers
 * Maps status codes to translation key resolvers
 * Checked AFTER error codes for specificity
 */
const STATUS_CODE_HANDLERS: Record<number, ErrorCodeHandler> = {
  0: (t) => t('errors.networkError'),
  400: (t) => t('errors.badRequest'),
  401: (t) => t('errors.unauthorized'),
  403: (t) => t('errors.forbidden'),
  404: (t) => t('errors.notFound'),
  429: (t) => t('errors.rateLimitExceeded'),
  500: (t) => t('errors.serverError'),
  503: (t) => t('errors.serviceUnavailable'),
};

/**
 * Maps backend error codes and status codes to localized user-friendly messages
 * 
 * Priority order:
 * 1. Specific error code from backend (most specific)
 * 2. HTTP status code (generic)
 * 3. Fallback to generic error message
 * 
 * This ensures we always show the most relevant error message available.
 */
export const getLocalizedErrorMessage = (
  error: ApiError,
  t: (key: string) => string,
): string =>
{
  // Priority 1: Check for specific error code from backend
  if (error.error && ERROR_CODE_HANDLERS[error.error])
  {
    return ERROR_CODE_HANDLERS[error.error](t);
  }

  // Priority 2: Check HTTP status code
  if (STATUS_CODE_HANDLERS[error.statusCode])
  {
    return STATUS_CODE_HANDLERS[error.statusCode](t);
  }

  // Priority 3: Fallback to generic error
  return t('errors.genericError');
};

/**
 * Determines if an error should be treated as a "success" from UX perspective
 * 
 * Example: User clicks verification link but email is already verified.
 * Technically an error, but should be shown as success to the user.
 */
export const isSuccessError = (error: ApiError): boolean =>
{
  const successErrorCodes = ['EMAIL_ALREADY_VERIFIED'];
  return error.error ? successErrorCodes.includes(error.error) : false;
};

/**
 * Register a custom error code handler
 * Useful for feature-specific error codes without modifying this file
 * 
 * @example
 * registerErrorCodeHandler('PRODUCT_NOT_FOUND', (t) => t('inventory.errors.productNotFound'))
 */
export const registerErrorCodeHandler = (
  errorCode: string,
  handler: ErrorCodeHandler,
): void =>
{
  ERROR_CODE_HANDLERS[errorCode] = handler;
};

/**
 * Register a custom status code handler
 * Useful for handling non-standard status codes
 * 
 * @example
 * registerStatusCodeHandler(418, (t) => t('errors.imATeapot'))
 */
export const registerStatusCodeHandler = (
  statusCode: number,
  handler: ErrorCodeHandler,
): void =>
{
  STATUS_CODE_HANDLERS[statusCode] = handler;
};
