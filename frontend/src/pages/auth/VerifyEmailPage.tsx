import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface VerifyEmailPageProps
{
    className?: string;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ className }) =>
{
    const [isResending, setIsResending] = React.useState(false);
    const [resent, setResent] = React.useState(false);

    const handleResendEmail = () =>
    {
        setIsResending(true);
        // TODO: Implement resend verification email
        setTimeout(() =>
        {
            setIsResending(false);
            setResent(true);
        }, 1500);
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
                            Check your email
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

                        {resent && (
                            <div className="flex items-center justify-center space-x-2 text-success">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-body text-sm">Verification email sent!</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={handleResendEmail}
                            variant="outline"
                            className="w-full h-touch font-body"
                            disabled={isResending || resent}
                        >
                            {isResending ? (
                                <>
                                    <InlineSpinner className="mr-2" />
                                    Sending...
                                </>
                            ) : resent ? (
                                <>
                                    <CheckCircle className="mr-2 w-4 h-4" />
                                    Email sent
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
