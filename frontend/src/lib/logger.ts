/**
 * Logger Utility
 * 
 * Centralized logging that adapts to environment:
 * - Development: Console logging
 * - Production: Can integrate with error tracking services (Sentry, LogRocket, etc.)
 */

/**
 * Log an error message with optional data
 * 
 * @param message - Error message to log
 * @param data - Optional error data or context
 */
export const logger = {
  error: (message: string, data?: unknown) =>
  {
    if (import.meta.env.DEV)
    {
      console.error(message, data);
    }
    
    // TODO: In production, send to error tracking service
    // Example with Sentry:
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(new Error(message), { 
    //     extra: data,
    //   });
    // }
  },

  warn: (message: string, data?: unknown) =>
  {
    if (import.meta.env.DEV)
    {
      console.warn(message, data);
    }
    
    // TODO: Send warnings to monitoring service in production
  },

  info: (message: string, data?: unknown) =>
  {
    if (import.meta.env.DEV)
    {
      console.info(message, data);
    }
    
    // TODO: Send info logs to analytics service in production
  },
};
