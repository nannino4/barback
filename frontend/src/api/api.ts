import type { ApiError } from '@/types/api';
import { AuthTokenManager, addAuthInterceptor } from '@/lib/auth-tokens';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

interface ErrorResponse
{
    message: string;
    error?: string;
    field?: string;
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

  async request<T>(
    endpoint: string,
        options: RequestInit = {},
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

    // Apply auth interceptor to add Authorization header
    config = addAuthInterceptor(config);

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
            const errorData = await retryResponse.json().catch((): ErrorResponse => ({
              message: 'An unexpected error occurred',
            })) as ErrorResponse;
                        
            const apiError: ApiError = {
              message: errorData.message || 'An unexpected error occurred',
              status: retryResponse.status,
              error: errorData.error,
              field: errorData.field,
              retryAfter: retryResponse.status === 429 
                ? parseInt(retryResponse.headers.get('Retry-After') || '60', 10)
                : undefined,
            };
                        
            throw new Error(JSON.stringify(apiError));
          }
                    
          // Check if retry response has content before parsing JSON
          const retryContentType = retryResponse.headers.get('content-type');
          const retryContentLength = retryResponse.headers.get('content-length');
          
          if (!retryContentType?.includes('application/json') || retryContentLength === '0' || retryResponse.status === 204)
          {
            return {} as T;
          }
          
          return await retryResponse.json() as T;
        }
        catch (refreshError)
        {
          // If refresh fails, clear tokens and redirect to login
          AuthTokenManager.clearTokens();
          window.location.href = '/auth/login';
          throw refreshError;
        }
      }
            
      if (!response.ok)
      {
        const errorData = await response.json().catch((): ErrorResponse => ({
          message: 'An unexpected error occurred',
        })) as ErrorResponse;
                
        const apiError: ApiError = {
          message: errorData.message || 'An unexpected error occurred',
          status: response.status,
          error: errorData.error,
          field: errorData.field,
          retryAfter: response.status === 429 
            ? parseInt(response.headers.get('Retry-After') || '60', 10)
            : undefined,
        };
                
        throw new Error(JSON.stringify(apiError));
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // If no content or empty response, return empty object
      if (!contentType?.includes('application/json') || contentLength === '0' || response.status === 204)
      {
        return {} as T;
      }

      return await response.json() as T;
    }
    catch (error)
    {
      if (error instanceof TypeError)
      {
        // Network error
        const networkError: ApiError = {
          message: 'Network error. Please check your connection.',
          status: 0,
        };
        throw new Error(JSON.stringify(networkError));
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);