import { ApiError, NetworkError, ValidationError } from '@/lib/errors';
import { AuthTokenManager, addAuthHeader } from '@/lib/auth-tokens';
import { logger } from '@/lib/logger';
import { generateRequestId, REQUEST_ID_HEADER } from '@/lib/request-id';
import { z } from 'zod';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

/**
 * Backend error response structure
 * Matches the error format from backend API documentation
 */
const ErrorResponseSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  statusCode: z.number(),
});

class ApiClient
{
  private baseUrl: string;
  private onSessionExpired?: () => void;
  private defaultTimeoutMs = 30000; // 30 seconds default timeout

  constructor(baseUrl: string)
  {
    this.baseUrl = baseUrl;
  }

  /**
   * Set callback for when session expires
   * Should be called by AuthProvider on initialization
   * 
   * Note: With proactive token refresh, this should rarely be called.
   * It's a fallback for edge cases where a 401 occurs despite refresh attempts.
   */
  setSessionExpiredHandler(handler: () => void): void
  {
    this.onSessionExpired = handler;
  }

  /**
   * Execute fetch with timeout using AbortController
   * Prevents requests from hanging indefinitely
   */
  private async fetchWithTimeout(
    url: string,
    config: RequestInit,
    timeoutMs = this.defaultTimeoutMs,
  ): Promise<Response>
  {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try
    {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      return response;
    }
    catch (error)
    {
      if (error instanceof Error && error.name === 'AbortError')
      {
        logger.warn(`Request timeout after ${timeoutMs}ms:`, url);
        throw new NetworkError('timeout'); // Timeout error
      }
      throw error;
    }
    finally
    {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Handle session expiration (401 with specific error codes)
   * 
   * Only clears tokens and triggers handler for actual session expiry,
   * not for other 401 errors like invalid credentials during login.
   * 
   * @param errorCode - The error code from the backend response
   */
  private handleSessionExpired(errorCode?: string): void
  {
    // Only handle as session expiry for token-related errors
    const isTokenError = errorCode === 'INVALID_ACCESS_TOKEN' || errorCode === 'INVALID_REFRESH_TOKEN';
    
    if (!isTokenError)
    {
      return; // Let normal error handling proceed
    }
    
    const hasTokens = AuthTokenManager.getAccessToken() !== null;
    
    AuthTokenManager.clearTokens();
    
    // Only trigger session expired handler if we actually had tokens
    // This prevents double-triggering when token refresh fails
    if (hasTokens && this.onSessionExpired)
    {
      this.onSessionExpired();
    }
  }

  /**
   * Helper to parse error response and create ApiError
   * 
   * Note: Backend returns validation errors as arrays of translation keys,
   * not plain English messages. These keys need to be translated in the UI.
   */
  private async parseErrorResponse(response: Response): Promise<ApiError>
  {
    try
    {
      const rawData: unknown = await response.json();
      
      // Validate error response structure with Zod
      const errorData = ErrorResponseSchema.parse(rawData);
      
      // Backend validation errors are arrays of translation keys
      let message: string | string[];
      if (Array.isArray(errorData.message))
      {
        // Filter out empty arrays or use fallback translation key
        message = errorData.message.length > 0 
          ? errorData.message 
          : ['errors.validationError'];
      }
      else
      {
        message = errorData.message || 'errors.validationError';
      }
      
      return new ApiError(
        message,
        response.status,
        errorData.error,
      );
    }
    catch (parseError)
    {
      // Log the parsing failure for debugging
      logger.warn('Failed to parse error response:', {
        status: response.status,
        url: response.url,
        error: parseError,
      });
      
      // In development, include parse error details for debugging
      if (import.meta.env.DEV)
      {
        const parseErrorMsg = parseError instanceof Error 
          ? parseError.message 
          : 'Unknown parse error';
        
        return new ApiError(
          `Failed to parse error response: ${parseErrorMsg}`,
          response.status,
        );
      }
      
      // If we can't parse the error response, return generic error
      return new ApiError(
        'errors.genericError',
        response.status,
      );
    }
  }

  /**
   * Handle fetch errors and convert TypeErrors to NetworkErrors
   */
  private handleFetchError(error: unknown): never
  {
    // Network errors from fetch API have specific characteristics
    if (error instanceof TypeError)
    {
      const errorMessage = error.message.toLowerCase();
      
      // Detect CORS errors
      if (errorMessage.includes('cors'))
      {
        throw new NetworkError('cors');
      }
      
      // Detect connection refused
      if (errorMessage.includes('connection refused') || errorMessage.includes('econnrefused'))
      {
        throw new NetworkError('connection-refused');
      }
      
      // Detect DNS failures
      if (errorMessage.includes('dns') || errorMessage.includes('enotfound') || errorMessage.includes('getaddrinfo'))
      {
        throw new NetworkError('dns-failure');
      }
      
      // Generic network error
      const isNetworkError = 
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('failed to fetch');
      
      if (isNetworkError)
      {
        throw new NetworkError();
      }
    }
    throw error;
  }

  /**
   * Universal request method - handles both void and typed responses
   * 
   * @param endpoint - API endpoint path
   * @param options - Fetch request options (can include custom timeout)
   * @param schema - Optional Zod schema for response validation. If omitted, returns void.
   * 
   * Usage:
   * ```ts
   * // Void response (no body expected)
   * await apiClient.request('/auth/logout', { method: 'POST' });
   * 
   * // Typed response with validation
   * const user = await apiClient.request('/users/me', { method: 'GET' }, UserSchema);
   * 
   * // Custom timeout for long-running request
   * const report = await apiClient.request(
   *   '/reports/generate',
   *   { method: 'POST', timeout: 120000 }, // 2 minutes
   *   ReportSchema
   * );
   * ```
   * 
   * Note: Content-Type is set to 'application/json' automatically when a body is present.
   * For non-JSON bodies (e.g., FormData), set Content-Type in options.headers to override.
   */
  async request<T = void>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {},
    schema?: z.ZodSchema<T>,
  ): Promise<T>
  {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Extract custom timeout if provided
    const { timeout, ...fetchOptions } = options;
    
    // Build base config
    const hasBody = fetchOptions.body !== undefined;
    const isFormDataBody = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

    const headers = new Headers(fetchOptions.headers);

    if (hasBody && !isFormDataBody && !headers.has('Content-Type'))
    {
      headers.set('Content-Type', 'application/json');
    }

    if (!headers.has(REQUEST_ID_HEADER))
    {
      headers.set(REQUEST_ID_HEADER, generateRequestId());
    }

    let config: RequestInit = {
      ...fetchOptions,
      headers,
    };

    // Add Authorization header if access token exists
    config = addAuthHeader(config);

    try
    {
      // Use custom timeout or default
      const response = await this.fetchWithTimeout(
        url,
        config,
        timeout || this.defaultTimeoutMs,
      );
            
      // Handle error responses
      if (!response.ok)
      {
        const apiError = await this.parseErrorResponse(response);
        
        // Check if this is a session expiry error (401 with token-related error codes)
        // This handles the edge case where tokens expire despite proactive refresh
        if (response.status === 401)
        {
          this.handleSessionExpired(apiError.error);
        }
        
        throw apiError;
      }

      // If no schema provided, return void (don't parse response body)
      if (!schema)
      {
        return undefined as T; // void responses
      }

      // Validate Content-Type before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json'))
      {
        logger.warn('Non-JSON response received:', {
          status: response.status,
          contentType,
          url: response.url,
        });
        throw new ApiError(
          'errors.validationError',
          response.status,
        );
      }

      // Parse and validate response body
      const data: unknown = await response.json();
      
      try
      {
        return schema.parse(data);
      }
      catch (zodError)
      {
        // Schema validation failed - backend returned unexpected data
        logger.error('API response validation error:', zodError);
        throw new ValidationError(response.status);
      }
    }
    catch (error)
    {
      this.handleFetchError(error);
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);