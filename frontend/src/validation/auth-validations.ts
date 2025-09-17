import { z } from 'zod';
import { getValidationMessage } from '@/validation/validation-utils';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, getValidationMessage('validation.password.minLength'))
  .regex(/[A-Z]/, getValidationMessage('validation.password.uppercase'))
  .regex(/[a-z]/, getValidationMessage('validation.password.lowercase'))
  .regex(/[0-9]/, getValidationMessage('validation.password.number'))
  .regex(/[^A-Za-z0-9]/, getValidationMessage('validation.password.specialChar'));

// Registration schema
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

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, getValidationMessage('validation.email.required'))
    .email(getValidationMessage('validation.email.invalid')),
  password: z.string().min(1, getValidationMessage('validation.password.required')),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, getValidationMessage('validation.email.required'))
    .email(getValidationMessage('validation.email.invalid')),
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, getValidationMessage('validation.password.confirmRequired')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: getValidationMessage('validation.password.noMatch'),
    path: ['confirmPassword'],
  });

// Infer types from schemas
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
