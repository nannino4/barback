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

    constructor(baseUrl: string)
    {
        this.baseUrl = baseUrl;
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