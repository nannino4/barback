import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineSpinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { loginSchema, type LoginData } from '@/lib/auth-validations';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from '@/components/features/auth/GoogleLoginButton';
import { cn } from '@/lib/utils';

interface LoginFormProps
{
    className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className }) =>
{
    const [showPassword, setShowPassword] = React.useState(false);
    const { login, isLoggingIn, error } = useAuth();

    const form = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginData) =>
    {
        login(data);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault();
        void form.handleSubmit(onSubmit)(e);
    };

    return (
        <Card className={cn('w-full max-w-md mx-auto bg-card border-border', className)}>
            <CardHeader className="text-center space-y-2">
                <CardTitle className="font-heading text-2xl font-semibold text-foreground">
                    Welcome back
                </CardTitle>
                <CardDescription className="font-body text-sm text-muted-foreground">
                    Sign in to your account to continue
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Google Login */}
                <GoogleLoginButton />

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground font-body">
                            Or continue with email
                        </span>
                    </div>
                </div>

                {/* Email/Password Form */}
                <Form {...form}>
                    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-body text-sm font-medium text-foreground">
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter your email"
                                            disabled={isLoggingIn}
                                            className="font-body"
                                            autoComplete="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-body text-sm font-medium text-foreground">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                disabled={isLoggingIn}
                                                className="font-body pr-10"
                                                autoComplete="current-password"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isLoggingIn}
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

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link
                                to="/auth/forgot-password"
                                className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        </div>

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
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? (
                                <>
                                    <InlineSpinner className="mr-2" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </Form>

                {/* Register Link */}
                <div className="text-center">
                    <p className="font-body text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link
                            to="/auth/register"
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
