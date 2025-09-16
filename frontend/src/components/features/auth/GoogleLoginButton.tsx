import React from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/spinner';
import { authApi } from '@/api/auth-api';
import { cn } from '@/lib/utils';

interface GoogleLoginButtonProps
{
    className?: string;
    disabled?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
    className,
    disabled = false,
}) =>
{
    const googleAuthMutation = useMutation({
        mutationFn: () => authApi.getGoogleAuthUrl(),
        onSuccess: (data) =>
        {
            // Store state for validation when user returns
            if (data.state)
            {
                sessionStorage.setItem('google_oauth_state', data.state);
            }
            // Redirect to Google OAuth
            window.location.href = data.authUrl;
        },
        onError: (error: Error) =>
        {
            try
            {
                const errorData = JSON.parse(error.message) as { message?: string };
                toast.error(errorData.message || 'Failed to connect to Google');
            }
            catch
            {
                toast.error('Failed to connect to Google. Please try again.');
            }
        },
    });

    const handleGoogleLogin = () =>
    {
        googleAuthMutation.mutate();
    };

    return (
        <Button
            type="button"
            variant="outline"
            className={cn(
                'w-full h-touch relative',
                'border border-border hover:bg-muted',
                'font-body text-sm font-medium',
                className,
            )}
            onClick={handleGoogleLogin}
            disabled={disabled || googleAuthMutation.isPending}
        >
            {googleAuthMutation.isPending ? (
                <>
                    <InlineSpinner className="mr-2" />
                    Connecting to Google...
                </>
            ) : (
                <>
                    {/* Google Logo SVG */}
                    <svg
                        className="mr-2 h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </>
            )}
        </Button>
    );
};
