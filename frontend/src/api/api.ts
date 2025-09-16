import type { ApiError } from '@/types/api';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

interface ErrorResponse
{
    message: string;
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
        const refreshToken = localStorage.getItem('refreshToken');
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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Redirect to login
            window.location.href = '/auth/login';
            throw new Error('Session expired');
        }

        const data = await response.json() as { access_token: string; refresh_token: string };
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        
        return data.access_token;
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T>
    {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add authorization header if token exists
        const token = localStorage.getItem('accessToken');
        if (token)
        {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        try
        {
            const response = await fetch(url, config);
            
            // Handle 401 Unauthorized - attempt token refresh
            if (response.status === 401 && token)
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
                            field: errorData.field,
                        };
                        
                        throw new Error(JSON.stringify(apiError));
                    }
                    
                    return await retryResponse.json() as T;
                }
                catch (refreshError)
                {
                    // If refresh fails, clear tokens and redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
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
                    field: errorData.field,
                };
                
                throw new Error(JSON.stringify(apiError));
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