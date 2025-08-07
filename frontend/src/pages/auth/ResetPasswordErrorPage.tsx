import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/components/features/auth/AuthCard';

export const ResetPasswordErrorPage: React.FC = () =>
{
    return (
        <AuthLayout>
            <AuthCard
                title="Reset Link Expired"
                description="This password reset link has expired or is invalid. Reset links are only valid for 15 minutes for security reasons."
            >
                <div className="text-center space-y-6">
                    {/* Error Icon */}
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>

                    {/* What can you do section */}
                    <div className="space-y-3">
                        <p className="font-body text-sm text-foreground font-medium">
                            What can you do?
                        </p>
                        <ul className="space-y-2 text-left">
                            <li className="flex items-start space-x-2">
                                <span className="text-primary">•</span>
                                <span className="font-body text-sm text-muted-foreground">
                                    Request a new password reset link
                                </span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-primary">•</span>
                                <span className="font-body text-sm text-muted-foreground">
                                    Try signing in if you remember your password
                                </span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-primary">•</span>
                                <span className="font-body text-sm text-muted-foreground">
                                    Contact support if you continue having issues
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {/* Request New Reset Link Button */}
                        <Button
                            asChild
                            className="w-full h-touch font-body text-sm font-medium"
                        >
                            <Link to="/auth/forgot-password">
                                <Mail className="mr-2 h-4 w-4" />
                                Request New Reset Link
                            </Link>
                        </Button>

                        {/* Back to Login Button */}
                        <Button
                            asChild
                            variant="outline"
                            className="w-full h-touch font-body text-sm font-medium"
                        >
                            <Link to="/auth/login">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </Button>
                    </div>

                    {/* Support Contact */}
                    <div className="pt-4 border-t border-border">
                        <p className="font-body text-xs text-muted-foreground">
                            Need help?{' '}
                            <a
                                href="mailto:support@barback.app"
                                className="text-primary hover:text-primary/80 transition-colors"
                            >
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            </AuthCard>
        </AuthLayout>
    );
};
