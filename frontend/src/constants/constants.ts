/**
 * Application-wide constants
 */

/**
 * Delay before redirecting after a successful operation (in milliseconds)
 * Used to give users time to read success messages
 */
export const SUCCESS_REDIRECT_DELAY = 3000; // 3 seconds

/**
 * Cooldown duration between email verification resend requests (in milliseconds)
 * Prevents spam and reduces server load
 */
export const EMAIL_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

/**
 * Cooldown duration between password reset requests (in milliseconds)
 * Prevents spam and reduces server load
 */
export const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000; // 60 seconds
