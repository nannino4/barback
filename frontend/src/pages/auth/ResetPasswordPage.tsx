import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineSpinner } from '@/components/ui/spinner';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { resetPasswordSchema, type ResetPasswordData } from '@/validation/auth-validations';
import { authApi } from '@/api/auth-api';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard, AuthFooterLink } from '@/components/features/auth/AuthCard';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PasswordRequirement
{
    label: string;
    test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
    {
        label: 'At least 8 characters',
        test: (password) => password.length >= 8,
    },
    {
        label: 'One uppercase letter',
        test: (password) => /[A-Z]/.test(password),
    },
    {
        label: 'One lowercase letter',
        test: (password) => /[a-z]/.test(password),
    },
    {
        label: 'One number',
        test: (password) => /[0-9]/.test(password),
    },
    {
        label: 'One special character',
        test: (password) => /[^A-Za-z0-9]/.test(password),
    },
];

export const ResetPasswordPage: React.FC = () =>
{
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const form = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const password = form.watch('password');

    // Validate token when component mounts
    React.useEffect(() =>
    {
        if (!token)
        {
            navigate('/auth/reset-password/error', { replace: true });
            return;
        }

        const validateToken = async () =>
        {
            try
            {
                await authApi.validateResetToken(token);
            }
            catch (error)
            {
                navigate('/auth/reset-password/error', { replace: true });
            }
        };

        void validateToken();
    }, [token, navigate]);

    const onSubmit = async (data: ResetPasswordData) =>
    {
        if (!token)
        {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try
        {
            await authApi.resetPassword(token, data.password);
            toast.success('Password updated successfully');
            navigate('/auth/reset-password/success', { replace: true });
        }
        catch (error: any)
        {
            if (error?.message?.includes('expired') || error?.message?.includes('invalid'))
            {
                navigate('/auth/reset-password/error', { replace: true });
            }
            else
            {
                setError(error?.message || 'Failed to reset password. Please try again.');
            }
        }
        finally
        {
            setIsSubmitting(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        void form.handleSubmit(onSubmit)(e);
    };

    if (!token)
    {
        return null; // Will redirect in useEffect
    }

    return (
        <AuthLayout>
            <AuthCard
                title="Reset Your Password"
                description="Enter a new password for your account"
                footer={
                    <AuthFooterLink
                        text=""
                        linkText="Back to Sign In"
                        linkTo="/auth/login"
                    />
                }
            >
                <Form {...form}>
                    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                        {/* New Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-body text-sm font-medium text-foreground">
                                        New Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your new password"
                                                disabled={isSubmitting}
                                                className="font-body pl-10 pr-10"
                                                autoComplete="new-password"
                                                autoFocus
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isSubmitting}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">
                                                    {showPassword ? 'Hide password' : 'Show password'}
                                                </span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password Field */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-body text-sm font-medium text-foreground">
                                        Confirm Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm your new password"
                                                disabled={isSubmitting}
                                                className="font-body pl-10 pr-10"
                                                autoComplete="new-password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={isSubmitting}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">
                                                    {showConfirmPassword ? 'Hide password' : 'Show password'}
                                                </span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Requirements */}
                        {password && (
                            <div className="space-y-2">
                                <p className="font-body text-sm font-medium text-foreground">
                                    Password Requirements:
                                </p>
                                <div className="space-y-1">
                                    {passwordRequirements.map((requirement, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-2"
                                        >
                                            {requirement.test(password) ? (
                                                <CheckCircle className="h-4 w-4 text-success" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <span
                                                className={cn(
                                                    'font-body text-xs',
                                                    requirement.test(password)
                                                        ? 'text-success'
                                                        : 'text-muted-foreground'
                                                )}
                                            >
                                                {requirement.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                <p className="font-body text-sm text-destructive">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-touch font-body text-sm font-medium"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <InlineSpinner className="mr-2" />
                                    Updating Password...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </Button>
                    </form>
                </Form>
            </AuthCard>
        </AuthLayout>
    );
};
