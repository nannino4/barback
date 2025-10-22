/**
 * AuthTokenManager - Centralized token management
 * 
 * Provides a clean interface for managing authentication tokens
 * with localStorage as the storage mechanism.
 */
export class AuthTokenManager
{
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

  /**
   * Get the current access token
   */
  static getAccessToken(): string | null
  {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get the current refresh token
   */
  static getRefreshToken(): string | null
  {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Store both access and refresh tokens
   */
  static setTokens(accessToken: string, refreshToken: string): void
  {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Clear all authentication tokens
   */
  static clearTokens(): void
  {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user has a valid session (has access token)
   */
  static hasValidSession(): boolean
  {
    return !!this.getAccessToken();
  }
}

/**
 * Auth interceptor that adds Authorization header to requests
 * Use this in the API client to automatically inject tokens
 */
export const addAuthInterceptor = (config: RequestInit): RequestInit =>
{
  const token = AuthTokenManager.getAccessToken();
  
  if (token)
  {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }
  
  return config;
};
