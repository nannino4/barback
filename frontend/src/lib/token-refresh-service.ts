import { AuthTokenManager } from '@/lib/auth-tokens';
import { logger } from '@/lib/logger';
import { RefreshTokenResponseSchema } from '@/types/auth';
import { ValidationError } from '@/lib/errors';

/**
 * TokenRefreshService - Proactive token refresh management
 * 
 * This service monitors JWT token expiration and automatically refreshes
 * tokens BEFORE they expire, eliminating the need for reactive 401 handling.
 * 
 * Features:
 * - Checks token expiration every minute
 * - Refreshes access token when it expires in < 5 minutes
 * - Triggers session expiration callback when refresh fails
 * - Prevents multiple concurrent refresh attempts
 * 
 * Architecture:
 * This replaces the reactive "wait for 401 then refresh" pattern with
 * a proactive "refresh before expiration" pattern, providing:
 * - Better UX (no failed requests)
 * - Simpler error handling (fewer edge cases)
 * - More predictable behavior
 */
export class TokenRefreshService
{
  private static instance: TokenRefreshService | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private refreshPromise: Promise<void> | null = null;
  private onSessionExpired?: () => void;
  private refreshTokenEndpoint: string;

  // Check every 1 minute
  private static readonly CHECK_INTERVAL_MS = 60 * 1000;
  
  // Refresh when token expires in < 5 minutes
  private static readonly REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

  private constructor(apiBaseUrl: string)
  {
    this.refreshTokenEndpoint = `${apiBaseUrl}/auth/refresh-token`;
  }

  /**
   * Get singleton instance
   */
  static getInstance(apiBaseUrl?: string): TokenRefreshService
  {
    if (!this.instance)
    {
      if (!apiBaseUrl)
      {
        throw new Error('API base URL required for first initialization');
      }
      this.instance = new TokenRefreshService(apiBaseUrl);
    }
    return this.instance;
  }

  /**
   * Set callback for when session expires (refresh token invalid/expired)
   */
  setSessionExpiredHandler(handler: () => void): void
  {
    this.onSessionExpired = handler;
  }

  /**
   * Start monitoring token expiration
   */
  start(): void
  {
    if (this.intervalId)
    {
      logger.warn('TokenRefreshService already started');
      return;
    }

    logger.info('TokenRefreshService started');
    
    // Check immediately on start
    void this.checkAndRefreshToken();
    
    // Then check periodically
    this.intervalId = setInterval(() =>
    {
      void this.checkAndRefreshToken();
    }, TokenRefreshService.CHECK_INTERVAL_MS);
  }

  /**
   * Stop monitoring token expiration
   */
  stop(): void
  {
    if (this.intervalId)
    {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('TokenRefreshService stopped');
    }
  }

  /**
   * Check token expiration and refresh if needed
   */
  private async checkAndRefreshToken(): Promise<void>
  {
    const accessToken = AuthTokenManager.getAccessToken();
    
    // No token = user not authenticated, nothing to do
    if (!accessToken)
    {
      return;
    }

    // Check if token will expire soon
    const willExpire = AuthTokenManager.willExpireSoon(
      accessToken,
      TokenRefreshService.REFRESH_THRESHOLD_MS,
    );

    if (!willExpire)
    {
      return; // Token still valid, no action needed
    }

    // Token expiring soon, refresh it
    logger.info('Access token expiring soon, refreshing...');
    await this.refreshAccessToken();
  }

  /**
   * Refresh the access token using the refresh token
   * 
   * This method uses a promise queue pattern to handle concurrent refresh requests.
   * If a refresh is already in progress, subsequent calls will wait for the same
   * promise to resolve instead of starting duplicate refresh requests.
   * 
   * Public method to allow manual refresh if needed
   */
  async refreshAccessToken(): Promise<void>
  {
    // Return existing refresh promise if one is in progress
    if (this.refreshPromise)
    {
      logger.info('Token refresh already in progress, waiting for completion...');
      return this.refreshPromise;
    }

    // Create new refresh promise
    this.refreshPromise = this.performRefresh();
    
    try
    {
      await this.refreshPromise;
    }
    finally
    {
      // Clear the promise when done (success or failure)
      this.refreshPromise = null;
    }
  }

  /**
   * Internal method that performs the actual token refresh
   */
  private async performRefresh(): Promise<void>
  {

    try
    {
      const refreshToken = AuthTokenManager.getRefreshToken();
      
      if (!refreshToken)
      {
        // No refresh token - user needs to login again
        throw new Error('INVALID_REFRESH_TOKEN');
      }

      // Let backend validate token expiration - it will return 401 if invalid/expired
      // This prevents race conditions and duplicate validation
      const response = await fetch(this.refreshTokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      // Handle auth failures (invalid/expired token) - permanent failures
      if (response.status === 401 || response.status === 403)
      {
        throw new Error('INVALID_REFRESH_TOKEN');
      }

      // Handle other errors - might be transient (network, server issues)
      if (!response.ok)
      {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      // Validate response with Zod schema
      const rawData: unknown = await response.json();
      
      try
      {
        const data = RefreshTokenResponseSchema.parse(rawData);
        
        // Store new tokens
        AuthTokenManager.setTokens(data.access_token, data.refresh_token);
        logger.info('Access token refreshed successfully');
      }
      catch (validationError)
      {
        logger.error('Invalid refresh token response format:', validationError);
        throw new ValidationError(response.status);
      }
    }
    catch (error)
    {
      logger.error('Token refresh failed:', error);
      
      // Only clear tokens and logout for authentication failures
      // Transient errors (network, 5xx) will retry on next interval
      if (error instanceof Error && error.message === 'INVALID_REFRESH_TOKEN')
      {
        // Invalid/expired refresh token - permanent failure, logout user
        AuthTokenManager.clearTokens();
        
        if (this.onSessionExpired)
        {
          this.onSessionExpired();
        }
      }
      else
      {
        // Transient error - keep tokens and retry on next check
        logger.warn('Token refresh failed (will retry on next interval):', error);
      }
    }
  }

  /**
   * Force an immediate token refresh (useful for testing or manual triggers)
   */
  async forceRefresh(): Promise<void>
  {
    await this.refreshAccessToken();
  }
}
