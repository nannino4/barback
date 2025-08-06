import React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/auth-api';
import type { ApiError } from '@/types/api';

export const GoogleCallbackPage: React.FC = () =>
{
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login: loginToStore } = useAuthStore();

    const handleGoogleCallbackMutation = useMutation({
        mutationFn: ({ code, state }: { code: string; state?: string }) =>
            authApi.handleGoogleCallback(code, state),
        onSuccess: (response) =>
        {
            // Store user data and tokens
            loginToStore(response.user, response.access_token, response.refresh_token);
            
            // Clear the OAuth state
            sessionStorage.removeItem('google_oauth_state');
            
            toast.success('Successfully signed in with Google!');
            void navigate('/');
        },
        onError: (error: Error) =>
        {
            // Clear the OAuth state
            sessionStorage.removeItem('google_oauth_state');
            
            try
            {
                const apiError = JSON.parse(error.message) as ApiError;
                toast.error(apiError.message);
            }
            catch
            {
                toast.error('Authentication failed. Please try again.');
            }
            void navigate('/auth/login');
        },
    });

    useEffect(() =>
    {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for OAuth errors
        if (error)
        {
            toast.error('Google authentication was cancelled or failed.');
            void navigate('/auth/login');
            return;
        }

        // Check for authorization code
        if (!code)
        {
            toast.error('Invalid authentication response from Google.');
            void navigate('/auth/login');
            return;
        }

        // Validate state parameter (CSRF protection)
        const storedState = sessionStorage.getItem('google_oauth_state');
        if (state && storedState && state !== storedState)
        {
            toast.error('Invalid authentication state. Please try again.');
            void navigate('/auth/login');
            return;
        }

        // Process the OAuth callback
        handleGoogleCallbackMutation.mutate({ code, state: state || undefined });
    }, [searchParams, navigate, handleGoogleCallbackMutation]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <Spinner 
                    size="lg" 
                    text="Completing Google sign-in..."
                    className="min-h-[200px]"
                />
                <p className="font-body text-sm text-muted-foreground">
                    Please wait while we complete your authentication...
                </p>
            </div>
        </div>
    );
};
