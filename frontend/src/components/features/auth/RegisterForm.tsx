import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { registerSchema, type RegisterFormData } from '@/lib/auth-validations';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface RegisterFormProps
{
    className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ className }) =>
{
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const { register, isRegistering, error } = useAuth();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: RegisterFormData) =>
    {
        register(data);
    };

    return (
        <Card className={cn('w-full max-w-md mx-auto bg-card border-border', className)}>
            <CardHeader className="text-center space-y-2">
                <CardTitle className="font-heading text-2xl font-semibold text-card-foreground">
                    Create Account
                </CardTitle>
                <CardDescription className="font-body text-sm text-muted-foreground">
                    Get started with your inventory management
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form 
                        onSubmit={(e) =>
                        {
                            e.preventDefault();
                            void form.handleSubmit(onSubmit)(e);
                        }} 
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-body text-sm font-medium text-foreground">
                                            First Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="John"
                                                autoComplete="given-name"
                                                className="h-touch bg-background border-input focus:border-ring focus:ring-2 focus:ring-ring/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-destructive text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-body text-sm font-medium text-foreground">
                                            Last Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Doe"
                                                autoComplete="family-name"
                                                className="h-touch bg-background border-input focus:border-ring focus:ring-2 focus:ring-ring/20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-destructive text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                            type="email"
                                            placeholder="john@example.com"
                                            autoComplete="email"
                                            className="h-touch bg-background border-input focus:border-ring focus:ring-2 focus:ring-ring/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive text-xs" />
                                </FormItem>
                            )}
                        />

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
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Create a strong password"
                                                autoComplete="new-password"
                                                className="h-touch bg-background border-input focus:border-ring focus:ring-2 focus:ring-ring/20 pr-12"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-destructive text-xs" />
                                </FormItem>
                            )}
                        />

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
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm your password"
                                                autoComplete="new-password"
                                                className="h-touch bg-background border-input focus:border-ring focus:ring-2 focus:ring-ring/20 pr-12"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-destructive text-xs" />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-touch bg-primary hover:bg-primary/90 text-primary-foreground font-body font-medium"
                            disabled={isRegistering}
                        >
                            {isRegistering ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>

                        <div className="text-center">
                            <span className="font-body text-sm text-muted-foreground">
                                Already have an account?{' '}
                            </span>
                            <Link
                                to="/login"
                                className="font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
