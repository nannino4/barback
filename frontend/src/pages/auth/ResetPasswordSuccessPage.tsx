import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard } from '@/components/features/auth/AuthCard';

export const ResetPasswordSuccessPage: React.FC = () =>
{
    return (
        <AuthLayout>
            <AuthCard
                title="Password Updated!"
                description="Your password has been successfully updated. You can now sign in with your new password."
            >
                <div className="text-center space-y-6">
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-success" />
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-3">
                        <p className="font-body text-sm text-muted-foreground">
                            For your security, all other sessions have been logged out.
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                            You will receive a confirmation email shortly.
                        </p>
                    </div>

                    {/* Sign In Button */}
                    <Button
                        asChild
                        className="w-full h-touch font-body text-sm font-medium"
                    >
                        <Link to="/auth/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In with New Password
                        </Link>
                    </Button>
                </div>
            </AuthCard>
        </AuthLayout>
    );
};
