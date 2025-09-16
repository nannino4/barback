import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/spinner';
import { authApi } from '@/api/auth-api';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/components/features/auth/AuthCard';
import toast from 'react-hot-toast';

export const ForgotPasswordSentPage: React.FC = () =>
{
    const location = useLocation();
    const email = location.state?.email || '';
    const [isResending, setIsResending] = React.useState(false);
    const [resendCooldown, setResendCooldown] = React.useState(0);

    React.useEffect(() =>
    {
        let timer: NodeJS.Timeout;
        if (resendCooldown > 0)
        {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleResendEmail = async () =>
    {
        if (!email || resendCooldown > 0)
        {
            return;
        }

        setIsResending(true);

        try
        {
            await authApi.forgotPassword(email);
            toast.success('Password reset email sent again');
            setResendCooldown(60); // 1 minute cooldown
        }
        catch (error)
        {
            // Always show generic message for security
            toast.success('If an account exists with that email, you will receive password reset instructions.');
            setResendCooldown(60);
        }
        finally
        {
            setIsResending(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard
                title="Check Your Email"
                description="We've sent password reset instructions to:"
            >
                <div className="text-center space-y-6">
                    {/* Email Icon */}
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                    </div>

                    {/* Email Address */}
                    {email && (
                        <p className="font-body text-sm font-semibold text-foreground">
                            {email}
                        </p>
                    )}

                    {/* Expiration Notice */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <p className="font-body text-sm">
                                The link will expire in 15 minutes.
                            </p>
                        </div>
                        <p className="font-body text-xs text-muted-foreground">
                            Didn't receive the email? Check your spam folder.
                        </p>
                    </div>

                    {/* Resend Email Button */}
                    {email && (
                        <Button
                            onClick={handleResendEmail}
                            variant="outline"
                            className="w-full h-touch font-body text-sm font-medium"
                            disabled={isResending || resendCooldown > 0}
                        >
                            {isResending ? (
                                <>
                                    <InlineSpinner className="mr-2" />
                                    Resending Email...
                                </>
                            ) : resendCooldown > 0 ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resend Email ({resendCooldown}s)
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resend Email
                                </>
                            )}
                        </Button>
                    )}

                    {/* Back to Login Link */}
                    <div className="pt-4 border-t border-border">
                        <Link
                            to="/auth/login"
                            className="font-body text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </AuthCard>
        </AuthLayout>
    );
};
