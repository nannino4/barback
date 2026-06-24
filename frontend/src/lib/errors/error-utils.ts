/**
 * Core Error Utility Functions
 * 
 * Provides error handling, localization, and type guards
 */

import type { TFunction } from 'i18next';
import { ApiError, NetworkError, ValidationError } from './api-error';
import { AUTH_ERROR_HANDLERS } from './auth-errors';
import { COMMON_ERROR_HANDLERS, STATUS_CODE_HANDLERS } from './common-errors';
import { isAuthErrorCode, isCommonErrorCode } from './error-codes';

/**
 * Format validation errors for display
 * 
 * @param errors - Array of error messages
 * @param context - Display context: 'form' returns all errors as list, 'toast' returns first error
 * @returns Formatted error message(s)
 */
export const formatValidationErrors = (
  errors: string[],
  context: 'form' | 'toast' = 'form',
): string =>
{
  if (errors.length === 0) return 'Validation error';
  
  // For toasts, return only the first error to keep it concise
  if (context === 'toast')
  {
    return errors[0];
  }
  
  // For forms, return all errors as a formatted list
  if (errors.length === 1)
  {
    return errors[0];
  }
  
  // Multiple errors: format as bullet list
  return errors.map((err) => `• ${err}`).join('\n');
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
 * @param t - Translation function from useI18n() (fully typed with i18next)
 * @param context - Display context: 'form' for full error lists, 'toast' for single error
 * @returns Localized error message
 */
export const getLocalizedErrorMessage = (
  error: ApiError | NetworkError | ValidationError,
  t: TFunction,
  context: 'form' | 'toast' = 'form',
): string =>
{
  // Handle network errors
  if (error instanceof NetworkError)
  {
    // Map specific reasons to detailed translation keys
    if (error.reason === 'timeout')
    {
      return t('errors.networkTimeout');
    }
    if (error.reason === 'cors')
    {
      return t('errors.networkCors');
    }
    if (error.reason === 'connection-refused')
    {
      return t('errors.networkConnectionRefused');
    }
    if (error.reason === 'dns-failure')
    {
      return t('errors.networkDnsFailure');
    }
    
    // Generic network error
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
      // Note: Backend validation keys might not be in our translation file,
      // so we disable type checking for this dynamic translation case
      const translatedErrors = error.validationErrors
        .map((key) =>
        {
          // @ts-expect-error - Backend can send dynamic validation keys not in our type definition
          const translated: string = t(key);
          // Only include translations that actually worked (changed from key)
          return translated !== key ? translated : null;
        })
        .filter((msg): msg is string => msg !== null); // Remove null entries
      
      // If no translations worked, fallback to generic validation error
      if (translatedErrors.length === 0)
      {
        return t('errors.validationError');
      }
      
      // Format based on context
      return formatValidationErrors(translatedErrors, context);
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
