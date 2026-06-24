import type { TFunction } from 'i18next';
import type { AuthErrorCode } from './error-codes';

/**
 * Authentication Error Code Mappings
 * 
 * Maps backend auth error codes to localized translation keys
 */

type ErrorCodeHandler = (t: TFunction) => string;

/**
 * Authentication-specific error code handlers
 * These handle business logic errors from the auth module
 */
export const AUTH_ERROR_HANDLERS: Record<AuthErrorCode, ErrorCodeHandler> = {
  // Email verification errors
  EMAIL_ALREADY_VERIFIED: (t) => t('auth.errors.emailAlreadyVerified'),
  INVALID_EMAIL_VERIFICATION_TOKEN: (t) => t('auth.errors.invalidOrExpiredToken'),
  
  // User errors
  USER_NOT_FOUND_BY_EMAIL: (t) => t('auth.errors.userNotFound'),
  
  // Authentication errors
  INVALID_CREDENTIALS: (t) => t('auth.errors.invalidCredentials'),
  INVALID_ACCESS_TOKEN: (t) => t('auth.errors.unauthorized'),
  INVALID_REFRESH_TOKEN: (t) => t('auth.errors.sessionExpired'),
  
  // Password reset errors
  INVALID_PASSWORD_RESET_TOKEN: (t) => t('auth.errors.invalidOrExpiredToken'),
  
  // Registration errors
  EMAIL_ALREADY_EXISTS: (t) => t('auth.errors.emailAlreadyExists'),
  
  // Authorization errors  
  WRONG_AUTH_PROVIDER: (t) => t('auth.errors.wrongAuthProvider'),
  
  // Google OAuth errors
  GOOGLE_TOKEN_EXCHANGE_FAILED: (t) => t('auth.errors.googleTokenExchangeFailed'),
  GOOGLE_USER_INFO_FAILED: (t) => t('auth.errors.googleUserInfoFailed'),
  GOOGLE_TOKEN_INVALID: (t) => t('auth.errors.googleTokenInvalid'),
  GOOGLE_EMAIL_NOT_VERIFIED: (t) => t('auth.errors.googleEmailNotVerified'),
  GOOGLE_ACCOUNT_LINKING_CONFLICT: (t) => t('auth.errors.googleAccountLinkingConflict'),
  GOOGLE_CONFIGURATION_ERROR: (t) => t('errors.serverError'),
  
  // Server errors (unlikely but possible)
  PASSWORD_HASHING_FAILED: (t) => t('errors.serverError'),
  TOKEN_GENERATION_FAILED: (t) => t('errors.serverError'),
  DATABASE_OPERATION_FAILED: (t) => t('errors.serverError'),
};
