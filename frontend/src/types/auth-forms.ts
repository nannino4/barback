import { z } from 'zod';
import i18n from '@/lib/i18n';

/**
 * Authentication Form Validation Schemas
 * 
 * These schemas validate user input in authentication forms (client-side).
 * They provide user-friendly, internationalized error messages and enforce
 * business logic rules (password complexity, field formats, etc.)
 * 
 * Usage: With React Hook Form + zodResolver
 */

// ============================================================================
// Shared Schemas
// ============================================================================

/**
 * Password validation schema with security requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
const passwordSchema = z
  .string()
  .min(8, i18n.t('validation.password.minLength'))
  .regex(/[A-Z]/, i18n.t('validation.password.uppercase'))
  .regex(/[a-z]/, i18n.t('validation.password.lowercase'))
  .regex(/[0-9]/, i18n.t('validation.password.number'))
  .regex(/[^A-Za-z0-9]/, i18n.t('validation.password.specialChar'));

// ============================================================================
// Form Schemas
// ============================================================================

/**
 * Registration form schema
 * Validates new user registration with password confirmation
 */
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, i18n.t('validation.name.firstNameRequired'))
      .max(50, i18n.t('validation.name.tooLong'))
    // Supports international characters including Latin accented letters
    // Pattern: English letters + Latin accented chars + spaces, hyphens, apostrophes
      .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]*$/, i18n.t('validation.name.invalidChars')),
    lastName: z
      .string()
      .min(1, i18n.t('validation.name.lastNameRequired'))
      .max(50, i18n.t('validation.name.tooLong'))
    // Supports international characters including Latin accented letters
      .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]*$/, i18n.t('validation.name.invalidChars')),
    email: z
      .string()
      .min(1, i18n.t('validation.email.required'))
      .email(i18n.t('validation.email.invalid'))
      .max(255, i18n.t('validation.email.tooLong')),
    phoneNumber: z
      .string()
      .optional()
      .refine((phone) =>
      {
        if (!phone || phone.trim() === '') return true; // Optional field
        // Accept any reasonable phone number format (international)
        // Minimum 7 digits, allow +, spaces, hyphens, parentheses
        const digitsOnly = phone.replace(/[\s\-()]/g, '');
        return /^\+?\d{7,15}$/.test(digitsOnly);
      }, i18n.t('validation.phone.invalidFormat')),
    password: passwordSchema,
    confirmPassword: z.string().min(1, i18n.t('validation.password.confirmRequired')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: i18n.t('validation.password.noMatch'),
    path: ['confirmPassword'],
  });

/**
 * Login form schema
 * Simple email + password validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, i18n.t('validation.email.required'))
    .email(i18n.t('validation.email.invalid')),
  password: z.string().min(1, i18n.t('validation.password.required')),
});

/**
 * Forgot password form schema
 * Only requires email address
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, i18n.t('validation.email.required'))
    .email(i18n.t('validation.email.invalid')),
});

/**
 * Reset password form schema
 * New password with confirmation
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, i18n.t('validation.password.confirmRequired')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: i18n.t('validation.password.noMatch'),
    path: ['confirmPassword'],
  });

// ============================================================================
// TypeScript Types - Inferred from Schemas
// ============================================================================

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// API data type (RegisterFormData without confirmPassword)
export type RegisterData = Omit<RegisterFormData, 'confirmPassword'>;
