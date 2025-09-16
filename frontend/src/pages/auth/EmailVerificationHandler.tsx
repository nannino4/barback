import React from 'react';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { authApi } from '@/api/auth-api';
import type { ApiError } from '@/types/api';

export const EmailVerificationHandler: React.FC = () =>
{
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const verifyEmailMutation = useMutation({
        mutationFn: (verificationToken: string) => authApi.verifyEmailByUrl(verificationToken),
        onSuccess: () =>
        {
            toast.success('Email verified successfully! You can now access all features.');
            void navigate('/', { replace: true });
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
            void navigate('/auth/verify-email', { replace: true });
        },
    });

    useEffect(() =>
    {
        if (!token)
        {
            toast.error('Invalid verification link.');
            void navigate('/auth/verify-email', { replace: true });
            return;
        }

        verifyEmailMutation.mutate(token);
    }, [token, verifyEmailMutation, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <Spinner 
                    size="lg" 
                    text="Verifying your email..."
                    className="min-h-[200px]"
                />
                <p className="font-body text-sm text-muted-foreground">
                    Please wait while we verify your email address...
                </p>
            </div>
        </div>
    );
};
