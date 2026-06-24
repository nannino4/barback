import { jwtDecode } from 'jwt-decode';

/**
 * JWT Payload structure for access and refresh tokens
 */
interface JwtPayload
{
  exp: number; // Expiration timestamp (seconds since epoch)
  sub: string; // Subject (user ID)
  iat: number; // Issued at timestamp
}

/**
 * AuthTokenManager - Centralized token management
 * 
 * Provides a clean interface for managing authentication tokens
 * with localStorage as the storage mechanism. Includes JWT expiration
 * checking to prevent unnecessary API calls.
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
   * Check if a JWT token is expired
   * @param token - JWT token to check
   * @returns true if expired or invalid, false if still valid
   */
  static isTokenExpired(token: string): boolean
  {
    try
    {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      return decoded.exp <= currentTime;
    }
    catch
    {
      // Invalid token format = treat as expired
      return true;
    }
  }

  /**
   * Get the expiration time of a JWT token
   * @param token - JWT token to parse
   * @returns Expiration timestamp in milliseconds, or null if invalid
   */
  static getTokenExpiration(token: string): number | null
  {
    try
    {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000; // Convert to milliseconds
    }
    catch
    {
      return null;
    }
  }

  /**
   * Check if token will expire within a certain time window
   * @param token - JWT token to check
   * @param windowMs - Time window in milliseconds (default: 5 minutes)
   * @returns true if token expires within the window
   */
  static willExpireSoon(token: string, windowMs = 5 * 60 * 1000): boolean
  {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    
    const timeUntilExpiry = expiration - Date.now();
    return timeUntilExpiry <= windowMs;
  }

  /**
   * Check if user has a valid session (has non-expired access token)
   */
  static hasValidSession(): boolean
  {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  /**
   * Check if refresh token is valid (exists and not expired)
   */
  static hasValidRefreshToken(): boolean
  {
    const token = this.getRefreshToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }
}

/**
 * Adds Authorization header to request config if access token exists
 * Use this in the API client to automatically inject auth tokens
 * 
 * Handles both plain object headers and Headers instances properly
 */
export const addAuthHeader = (config: RequestInit): RequestInit =>
{
  const token = AuthTokenManager.getAccessToken();
  
  if (!token) return config;
  
  // Create a new Headers instance to handle all header types
  const headers = new Headers(config.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  return {
    ...config,
    headers,
  };
};
