/**
 * Core Error Utility Functions
 * 
 * Provides error handling, localization, and type guards
 */

import { ApiError, NetworkError, ValidationError } from './api-error';
import { AUTH_ERROR_HANDLERS } from './auth-errors';
import { COMMON_ERROR_HANDLERS, STATUS_CODE_HANDLERS } from './common-errors';
import { isAuthErrorCode, isCommonErrorCode } from './error-codes';

/**
 * Format validation errors for toast display
 * Returns only the first error to keep toasts concise and readable
 * 
 * @param errors - Array of error messages
 * @returns First error message from the array
 */
export const formatValidationErrors = (errors: string[]): string =>
{
  // Always return the first error for toast notifications
  // Full error list should be displayed in forms or dedicated error UI
  return errors[0] || 'Validation error';
};

/**
 * Maps API errors to localized user-friendly messages
 * 
 * Priority order:
 * 1. Validation errors (translate each key and format as list)
 * 2. Specific error code from backend (most specific)
 * 3. HTTP status code (generic)
 * 4. Fallback to generic error message
 * 
 * @param error - ApiError instance with error code and status
 * @param t - Translation function from useI18n()
 * @returns Localized error message
 */
export const getLocalizedErrorMessage = (
  error: ApiError | NetworkError | ValidationError,
  t: (key: string) => string,
): string =>
{
  // Handle network errors
  if (error instanceof NetworkError)
  {
    return t('errors.networkError');
  }

  // Handle validation errors
  if (error instanceof ValidationError)
  {
    return error.message || t('errors.validationError');
  }

  // Handle API errors with error codes
  if (error instanceof ApiError)
  {
    // Priority 1: Handle validation errors (array of translation keys)
    if (error.validationErrors && error.validationErrors.length > 0)
    {
      // Translate each validation key, skip keys that don't translate
      const translatedErrors = error.validationErrors
        .map((key) =>
        {
          const translated = t(key);
          // Only include translations that actually worked (changed from key)
          return translated !== key ? translated : null;
        })
        .filter((msg): msg is string => msg !== null); // Remove null entries
      
      // If no translations worked, fallback to generic validation error
      if (translatedErrors.length === 0)
      {
        return t('errors.validationError');
      }
      
      // Format as list if multiple errors
      return formatValidationErrors(translatedErrors);
    }

    // Priority 2: Check auth-specific error codes (type-safe)
    if (error.error && isAuthErrorCode(error.error))
    {
      return AUTH_ERROR_HANDLERS[error.error](t);
    }

    // Priority 3: Check common error codes (type-safe)
    if (error.error && isCommonErrorCode(error.error))
    {
      return COMMON_ERROR_HANDLERS[error.error](t);
    }

    // Priority 4: Check HTTP status code
    if (error.statusCode in STATUS_CODE_HANDLERS)
    {
      return STATUS_CODE_HANDLERS[error.statusCode](t);
    }
  }

  // Priority 5: Fallback to generic error
  return t('errors.genericError');
};

/**
 * Type guard to check if error is any of our custom error types
 */
export const isKnownError = (
  error: unknown,
): error is ApiError | NetworkError | ValidationError =>
{
  return (
    ApiError.isApiError(error) ||
    NetworkError.isNetworkError(error) ||
    ValidationError.isValidationError(error)
  );
};
