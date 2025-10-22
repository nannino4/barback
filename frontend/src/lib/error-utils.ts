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
      status: 0,
    };
  }
};

/**
 * Maps backend error codes and status codes to localized user-friendly messages
 * Never expose raw backend messages to users
 */
export const getLocalizedErrorMessage = (
  error: ApiError,
  t: (key: string) => string,
): string =>
{
  // Check HTTP status codes first
  switch (error.status)
  {
  case 0:
    // Network error
    return t('errors.networkError');
    
  case 401:
    return t('errors.unauthorized');
    
  case 429:
    return t('errors.rateLimitExceeded');
    
  case 500:
    return t('errors.serverError');
  }

  // Then check specific error codes from backend
  switch (error.error)
  {
  // Email verification errors
  case 'EMAIL_ALREADY_VERIFIED':
    return t('auth.errors.emailAlreadyVerified');
    
  case 'INVALID_EMAIL_VERIFICATION_TOKEN':
    return t('auth.errors.invalidOrExpiredToken');
    
  case 'USER_NOT_FOUND_BY_EMAIL':
    return t('auth.errors.userNotFound');
    
  case 'EMAIL_SENDING_FAILED':
    return t('auth.errors.emailSendingFailed');
    
  case 'EMAIL_CONFIGURATION_ERROR':
    return t('auth.errors.emailConfigError');
    
  // Rate limiting
  case 'RATE_LIMIT_EXCEEDED':
    return t('errors.rateLimitExceeded');
    
  // Generic fallback
  default:
    return t('auth.errors.genericError');
  }
};

/**
 * Determines if an error is a "success" from UX perspective
 * Example: User clicks verification link but email is already verified
 */
export const isSuccessError = (error: ApiError): boolean =>
{
  return error.error === 'EMAIL_ALREADY_VERIFIED';
};
