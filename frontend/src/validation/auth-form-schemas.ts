import { z } from 'zod';
import { getValidationMessage } from '@/validation/validation-utils';

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
  .min(8, getValidationMessage('validation.password.minLength'))
  .regex(/[A-Z]/, getValidationMessage('validation.password.uppercase'))
  .regex(/[a-z]/, getValidationMessage('validation.password.lowercase'))
  .regex(/[0-9]/, getValidationMessage('validation.password.number'))
  .regex(/[^A-Za-z0-9]/, getValidationMessage('validation.password.specialChar'));

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
      .min(1, getValidationMessage('validation.name.firstNameRequired'))
      .max(50, getValidationMessage('validation.name.tooLong'))
    // Supports international characters including Italian accented letters
    // Pattern: English letters + Latin accented chars + spaces, hyphens, apostrophes
      .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]*$/, getValidationMessage('validation.name.invalidChars')),
    lastName: z
      .string()
      .min(1, getValidationMessage('validation.name.lastNameRequired'))
      .max(50, getValidationMessage('validation.name.tooLong'))
    // Supports international characters including Italian accented letters
      .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]*$/, getValidationMessage('validation.name.invalidChars')),
    email: z
      .string()
      .min(1, getValidationMessage('validation.email.required'))
      .email(getValidationMessage('validation.email.invalid'))
      .max(255, getValidationMessage('validation.email.tooLong')),
    phoneNumber: z
      .string()
      .optional()
      .refine((phone) =>
      {
        if (!phone || phone.trim() === '') return true; // Optional field
        // Italian mobile format: +39 3XX XXXXXXX
        return /^\+393\d{8,9}$/.test(phone.replace(/\s/g, ''));
      }, getValidationMessage('validation.phone.invalidFormat')),
    password: passwordSchema,
    confirmPassword: z.string().min(1, getValidationMessage('validation.password.confirmRequired')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: getValidationMessage('validation.password.noMatch'),
    path: ['confirmPassword'],
  });

/**
 * Login form schema
 * Simple email + password validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, getValidationMessage('validation.email.required'))
    .email(getValidationMessage('validation.email.invalid')),
  password: z.string().min(1, getValidationMessage('validation.password.required')),
});

/**
 * Forgot password form schema
 * Only requires email address
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, getValidationMessage('validation.email.required'))
    .email(getValidationMessage('validation.email.invalid')),
});

/**
 * Reset password form schema
 * New password with confirmation
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, getValidationMessage('validation.password.confirmRequired')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: getValidationMessage('validation.password.noMatch'),
    path: ['confirmPassword'],
  });

// ============================================================================
// TypeScript Types
// ============================================================================

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
