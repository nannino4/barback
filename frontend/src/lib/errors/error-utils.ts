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
 * Format validation errors as a readable list
 * Used when backend returns multiple validation errors
 * 
 * @param errors - Array of error messages
 * @returns Formatted error message (bullet list for multiple, single string for one)
 */
export const formatValidationErrors = (errors: string[]): string =>
{
  if (errors.length === 1)
  {
    return errors[0];
  }
  
  return errors.map((err, index) => `${index + 1}. ${err}`).join('\n');
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
      // Translate each validation key
      const translatedErrors = error.validationErrors.map((key) =>
      {
        // Try to translate the key, fallback to the key itself if not found
        const translated = t(key);
        return translated === key ? key : translated;
      });
      
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
