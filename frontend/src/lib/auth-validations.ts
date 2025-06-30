import { z } from 'zod';

// Password validation schema
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Registration schema
export const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(1, 'First name is required')
            .max(50, 'First name must be less than 50 characters')
            .regex(/^[a-zA-Z\s]*$/, 'First name can only contain letters and spaces'),
        lastName: z
            .string()
            .min(1, 'Last name is required')
            .max(50, 'Last name must be less than 50 characters')
            .regex(/^[a-zA-Z\s]*$/, 'Last name can only contain letters and spaces'),
        email: z
            .string()
            .min(1, 'Email is required')
            .email('Please enter a valid email address')
            .max(255, 'Email must be less than 255 characters'),
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

// Login schema
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Infer types from schemas
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
