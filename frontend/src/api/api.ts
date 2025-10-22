import type { ApiError } from '@/types/api';
import { AuthTokenManager, addAuthHeader } from '@/lib/auth-tokens';
import type { z } from 'zod';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

/**
 * Backend error response structure
 * Matches the error format from backend API documentation
 */
interface ErrorResponse
{
    message: string | string[]; // Can be single message or array of validation errors
    error?: string; // Error code (e.g., 'EMAIL_ALREADY_VERIFIED', 'RATE_LIMIT_EXCEEDED')
    field?: string; // Field name for validation errors
    statusCode: number;
}

class ApiClient
{
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string)
  {
    this.baseUrl = baseUrl;
  }

  private async refreshAccessToken(): Promise<string>
  {
    if (this.isRefreshing && this.refreshPromise)
    {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try
    {
      const newToken = await this.refreshPromise;
      return newToken;
    }
    finally
    {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string>
  {
    const refreshToken = AuthTokenManager.getRefreshToken();
    if (!refreshToken)
    {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok)
    {
      // Refresh token is invalid, clear all tokens
      AuthTokenManager.clearTokens();
      // Redirect to login
      window.location.href = '/auth/login';
      throw new Error('Session expired');
    }

    const data = await response.json() as { access_token: string; refresh_token: string };
    AuthTokenManager.setTokens(data.access_token, data.refresh_token);
        
    return data.access_token;
  }

  /**
   * Helper to check if response has JSON content
   */
  private hasJsonContent(response: Response): boolean
  {
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // No content scenarios
    if (response.status === 204) return false;
    if (contentLength === '0') return false;
    if (!contentType?.includes('application/json')) return false;
    
    return true;
  }

  /**
   * Helper to parse error response and create ApiError
   */
  private async parseErrorResponse(response: Response): Promise<ApiError>
  {
    try
    {
      const errorData = await response.json() as ErrorResponse;
      
      // Handle validation errors (array of messages)
      const message = Array.isArray(errorData.message) 
        ? errorData.message.join(', ')
        : errorData.message || 'An unexpected error occurred';
      
      return {
        message,
        statusCode: response.status,
        error: errorData.error,
        field: errorData.field,
      };
    }
    catch
    {
      // If we can't parse the error response, return generic error
      return {
        message: 'An unexpected error occurred',
        statusCode: response.status,
      };
    }
  }

  /**
   * Main request method with optional runtime validation
   * Returns void for empty responses (204, no content)
   * Returns T for JSON responses
   * 
   * @param endpoint - API endpoint path
   * @param options - Fetch request options
   * @param schema - Optional Zod schema for runtime validation
   */
  async request<T = void>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodSchema<T>,
  ): Promise<T>
  {
    const url = `${this.baseUrl}${endpoint}`;
        
    // Build base config
    let config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add Authorization header if access token exists
    config = addAuthHeader(config);

    try
    {
      const response = await fetch(url, config);
            
      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && AuthTokenManager.hasValidSession())
      {
        try
        {
          const newToken = await this.refreshAccessToken();
          
          // Retry the original request with new token
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          const retryResponse = await fetch(url, retryConfig);
                    
          if (!retryResponse.ok)
          {
            const apiError = await this.parseErrorResponse(retryResponse);
            throw new Error(JSON.stringify(apiError));
          }
                    
          // Handle successful retry response
          if (!this.hasJsonContent(retryResponse))
          {
            return undefined as T; // For void responses
          }
          
          const retryData: unknown = await retryResponse.json();
          
          // Validate with Zod schema if provided
          if (schema)
          {
            try
            {
              return schema.parse(retryData);
            }
            catch (zodError)
            {
              console.error('API response validation error:', zodError);
              const validationError: ApiError = {
                message: 'Invalid response format from server',
                statusCode: retryResponse.status,
              };
              throw new Error(JSON.stringify(validationError));
            }
          }
          
          return retryData as T;
        }
        catch (refreshError)
        {
          // If refresh fails, clear tokens and redirect to login
          AuthTokenManager.clearTokens();
          window.location.href = '/auth/login';
          throw refreshError;
        }
      }
            
      // Handle error responses
      if (!response.ok)
      {
        const apiError = await this.parseErrorResponse(response);
        throw new Error(JSON.stringify(apiError));
      }

      // Handle successful response
      if (!this.hasJsonContent(response))
      {
        return undefined as T; // For void responses
      }

      const data: unknown = await response.json();
      
      // Validate with Zod schema if provided
      if (schema)
      {
        try
        {
          return schema.parse(data);
        }
        catch (zodError)
        {
          // Schema validation failed - backend returned unexpected data
          console.error('API response validation error:', zodError);
          const validationError: ApiError = {
            message: 'Invalid response format from server',
            statusCode: response.status,
          };
          throw new Error(JSON.stringify(validationError));
        }
      }
      
      return data as T;
    }
    catch (error)
    {
      if (error instanceof TypeError)
      {
        // Network error (connection failed, CORS, etc.)
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        };
        throw new Error(JSON.stringify(networkError));
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);