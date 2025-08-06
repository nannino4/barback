import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, RefreshCw } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/spinner';
import { authApi } from '@/lib/auth-api';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { ApiError } from '@/types/api';

interface VerifyEmailPageProps
{
    className?: string;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ className }) =>
{
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const { user } = useAuthStore();

    // Auto-populate email if user is logged in
    React.useEffect(() =>
    {
        if (user?.email)
        {
            setEmail(user.email);
        }
    }, [user]);

    // Handle email verification from URL token
    const verifyFromTokenMutation = useMutation({
        mutationFn: (token: string) => authApi.verifyEmailByUrl(token),
        onSuccess: () =>
        {
            toast.success('Email verified successfully!');
            void navigate('/');
        },
        onError: (error: Error) =>
        {
            try
            {
                const apiError = JSON.parse(error.message) as ApiError;
                toast.error(apiError.message);
            }
            catch
            {
                toast.error('Email verification failed. Please try again.');
            }
        },
    });

    // Handle resend verification email
    const resendEmailMutation = useMutation({
        mutationFn: (emailAddress: string) => authApi.resendVerificationEmail(emailAddress),
        onSuccess: () =>
        {
            toast.success('Verification email sent! Check your inbox.');
        },
        onError: (error: Error) =>
        {
            try
            {
                const apiError = JSON.parse(error.message) as ApiError;
                toast.error(apiError.message);
            }
            catch
            {
                toast.error('Failed to send verification email. Please try again.');
            }
        },
    });

    // Check for token in URL params on mount
    React.useEffect(() =>
    {
        const token = searchParams.get('token');
        if (token)
        {
            verifyFromTokenMutation.mutate(token);
        }
    }, [searchParams, verifyFromTokenMutation]);

    const handleResendEmail = () =>
    {
        if (!email.trim())
        {
            toast.error('Please enter your email address');
            return;
        }
        resendEmailMutation.mutate(email);
    };

    return (
        <div className={cn('min-h-screen bg-background flex items-center justify-center p-4', className)}>
            <Card className="w-full max-w-md bg-card border-border">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="font-heading text-2xl font-semibold text-foreground">
                            Verify your email
                        </CardTitle>
                        <CardDescription className="font-body text-sm text-muted-foreground mt-2">
                            We've sent a verification link to your email address.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                        <p className="font-body text-sm text-muted-foreground">
                            Click the link in your email to verify your account and get started.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Email input for resend */}
                        <div className="space-y-2">
                            <label className="font-body text-sm font-medium text-foreground">
                                Email address
                            </label>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-touch font-body"
                                disabled={resendEmailMutation.isPending}
                            />
                        </div>

                        <Button
                            onClick={handleResendEmail}
                            variant="outline"
                            className="w-full h-touch font-body"
                            disabled={resendEmailMutation.isPending || !email.trim()}
                        >
                            {resendEmailMutation.isPending ? (
                                <>
                                    <InlineSpinner className="mr-2" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 w-4 h-4" />
                                    Resend verification email
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <Link
                                to="/auth/login"
                                className="font-body text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
