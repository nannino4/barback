/**
 * Custom Error Classes for API responses
 * 
 * These classes replace the JSON.stringify error serialization pattern
 * and provide type-safe error handling with proper instanceof checks.
 */

/**
 * Base API error class for all backend errors
 * Thrown when API returns an error response (4xx, 5xx)
 */
export class ApiError extends Error
{
  public readonly statusCode: number;
  public readonly error?: string; // Backend error code (e.g., 'EMAIL_ALREADY_VERIFIED')
  public readonly validationErrors?: string[]; // Array of validation error keys for translation

  constructor(
    message: string | string[],
    statusCode: number,
    error?: string,
  )
  {
    // Use generic message for Error.message when it's an array
    // Actual validation errors are stored in validationErrors property
    const messageString = Array.isArray(message) 
      ? 'Validation errors occurred' 
      : message;
    super(messageString);
    
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
    
    // Store validation errors as array if provided
    if (Array.isArray(message))
    {
      this.validationErrors = message;
    }
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace)
    {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Type guard to check if an error is an ApiError
   * Use this instead of try-catch with JSON.parse
   */
  static isApiError(error: unknown): error is ApiError
  {
    return error instanceof ApiError;
  }
}

/**
 * Network error class for connection failures
 * Thrown when fetch fails due to network issues (CORS, no connection, etc.)
 * 
 * Message is intentionally empty - localization happens in error-utils.ts
 */
export class NetworkError extends Error
{
  public readonly statusCode = 0;
  public readonly reason?: 'timeout' | 'cors' | 'connection-refused' | 'dns-failure';

  constructor(reason?: 'timeout' | 'cors' | 'connection-refused' | 'dns-failure')
  {
    super(''); // Empty message - will be localized by getLocalizedErrorMessage
    this.name = 'NetworkError';
    this.reason = reason;
    
    if (Error.captureStackTrace)
    {
      Error.captureStackTrace(this, NetworkError);
    }
  }

  static isNetworkError(error: unknown): error is NetworkError
  {
    return error instanceof NetworkError;
  }
}

/**
 * Validation error class for schema validation failures
 * Thrown when Zod validation fails on API responses
 * 
 * Message is intentionally empty - localization happens in error-utils.ts
 */
export class ValidationError extends Error
{
  public readonly statusCode: number;

  constructor(statusCode: number)
  {
    super(''); // Always empty - localized in error-utils
    this.name = 'ValidationError';
    this.statusCode = statusCode;
    
    if (Error.captureStackTrace)
    {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  static isValidationError(error: unknown): error is ValidationError
  {
    return error instanceof ValidationError;
  }
}
