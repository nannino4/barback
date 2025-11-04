import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth-api';
import { isKnownError, getLocalizedErrorMessage } from '@/lib/errors';
import { useI18n } from '@/hooks/useI18n';

type CallbackStatus = 'processing' | 'success' | 'error';

export const GoogleCallbackPage: React.FC = () =>
{
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: loginToStore } = useAuthStore();
  const { t } = useI18n();
  const hasAttemptedRef = useRef(false);
  const [callbackStatus, setCallbackStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleGoogleCallbackMutation = useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      authApi.handleGoogleCallback(code, state),
    onSuccess: (response) =>
    {
      // Store user data and tokens
      loginToStore(response.user, response.access_token, response.refresh_token);
            
      // Clear the OAuth state
      sessionStorage.removeItem('google_oauth_state');
            
      setCallbackStatus('success');
      toast.success(t('auth.errors.googleSignInSuccess'));
      
      // Navigate after short delay to show success state
      setTimeout(() =>
      {
        void navigate('/', { replace: true });
      }, 1000);
    },
    onError: (error: Error) =>
    {
      // Clear the OAuth state
      sessionStorage.removeItem('google_oauth_state');
      
      setCallbackStatus('error');
      
      if (isKnownError(error))
      {
        setErrorMessage(getLocalizedErrorMessage(error, t, 'form'));
      }
      else
      {
        setErrorMessage(t('auth.errors.authenticationFailed'));
      }
    },
  });

  useEffect(() =>
  {
    // Only attempt callback once using ref to prevent double-firing in StrictMode
    if (hasAttemptedRef.current) return;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error)
    {
      setCallbackStatus('error');
      setErrorMessage(t('auth.errors.googleAuthCancelled'));
      return;
    }

    // Check for authorization code
    if (!code)
    {
      setCallbackStatus('error');
      setErrorMessage(t('auth.errors.invalidGoogleResponse'));
      return;
    }

    // Validate state parameter (CSRF protection)
    // Backend MUST send state parameter - if missing, reject
    if (!state)
    {
      setCallbackStatus('error');
      setErrorMessage(t('auth.errors.invalidAuthState'));
      return;
    }

    // Validate state against stored value
    const storedState = sessionStorage.getItem('google_oauth_state');
    if (!storedState || state !== storedState)
    {
      sessionStorage.removeItem('google_oauth_state');
      setCallbackStatus('error');
      setErrorMessage(t('auth.errors.invalidAuthState'));
      return;
    }

    // Process the OAuth callback
    hasAttemptedRef.current = true;
    handleGoogleCallbackMutation.mutate({ code, state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only searchParams in dependencies

  const handleReturnToLogin = () =>
  {
    void navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {callbackStatus === 'processing' && (
        <div className="text-center space-y-4">
          <Spinner 
            size="lg" 
            text={t('auth.login.signingIn')}
            className="min-h-[200px]"
          />
          <p className="text-sm text-muted-foreground">
            {t('auth.login.googleLogin')}...
          </p>
        </div>
      )}

      {callbackStatus === 'error' && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {t('auth.errors.authenticationFailed')}
                  </h2>
                  <div className="text-sm text-destructive whitespace-pre-line">
                    {errorMessage}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleReturnToLogin}
                  className="w-full h-touch"
                >
                  {t('auth.login.backToLogin')}
                </Button>
                <Link to="/">
                  <Button
                    variant="outline"
                    className="w-full h-touch"
                  >
                    {t('nav.home')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
