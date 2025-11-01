import React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth-api';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
import { useI18n } from '@/hooks/useI18n';

export const GoogleCallbackPage: React.FC = () =>
{
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: loginToStore } = useAuthStore();
  const { t } = useI18n();

  const handleGoogleCallbackMutation = useMutation({
    mutationFn: ({ code, state }: { code: string; state?: string }) =>
      authApi.handleGoogleCallback(code, state),
    onSuccess: (response) =>
    {
      // Store user data and tokens
      loginToStore(response.user, response.access_token, response.refresh_token);
            
      // Clear the OAuth state
      sessionStorage.removeItem('google_oauth_state');
            
      toast.success(t('auth.errors.googleSignInSuccess'));
      void navigate('/');
    },
    onError: (error: Error) =>
    {
      // Clear the OAuth state
      sessionStorage.removeItem('google_oauth_state');
            
      if (ApiError.isApiError(error))
      {
        toast.error(getLocalizedErrorMessage(error, t));
      }
      else
      {
        toast.error(t('auth.errors.authenticationFailed'));
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
      toast.error(t('auth.errors.googleAuthCancelled'));
      void navigate('/auth/login');
      return;
    }

    // Check for authorization code
    if (!code)
    {
      toast.error(t('auth.errors.invalidGoogleResponse'));
      void navigate('/auth/login');
      return;
    }

    // Validate state parameter (CSRF protection)
    const storedState = sessionStorage.getItem('google_oauth_state');
    
    // CRITICAL: If we stored a state, we MUST validate it
    if (storedState)
    {
      if (!state || state !== storedState)
      {
        sessionStorage.removeItem('google_oauth_state');
        toast.error(t('auth.errors.invalidAuthState'));
        void navigate('/auth/login');
        return;
      }
    }

    // Process the OAuth callback
    handleGoogleCallbackMutation.mutate({ code, state: state || undefined });
  }, [searchParams, navigate, handleGoogleCallbackMutation, t]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner 
          size="lg" 
          text="Completing Google sign-in..."
          className="min-h-[200px]"
        />
        <p className="text-sm text-muted-foreground">
                    Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
};
