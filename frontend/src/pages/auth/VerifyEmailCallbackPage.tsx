import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '@/api/auth-api';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/hooks/useI18n';
import { useCooldown } from '@/hooks/useCooldown';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
import { SUCCESS_REDIRECT_DELAY } from '@/constants/constants';
import { ROUTES } from '@/constants/routes';

type VerificationStatus = 'verifying' | 'success' | 'error';

export const VerifyEmailCallbackPage: React.FC = () =>
{
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { t } = useI18n();
  const hasAttemptedRef = useRef(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Cooldown for redirect countdown
  const redirectCooldown = useCooldown('verify-email-redirect', SUCCESS_REDIRECT_DELAY);

  const verifyEmailMutation = useMutation({
    mutationFn: (verificationToken: string) => authApi.verifyEmailByUrl(verificationToken),
    onSuccess: () =>
    {
      // Update user's verification status in the store if user is logged in
      if (user)
      {
        setUser({ ...user, isEmailVerified: true });
      }
      
      setVerificationStatus('success');
      
      // Start countdown and delay navigation to show success state
      redirectCooldown.startCooldown();
      setTimeout(() =>
      {
        void navigate(user ? ROUTES.INVENTORY : '/auth/login', { replace: true });
      }, SUCCESS_REDIRECT_DELAY);
    },
    onError: (error: Error) =>
    {
      // Handle EMAIL_ALREADY_VERIFIED as success from UX perspective
      if (ApiError.isApiError(error) && error.error === 'EMAIL_ALREADY_VERIFIED')
      {
        // Update user's verification status if logged in
        if (user)
        {
          setUser({ ...user, isEmailVerified: true });
        }
        
        setVerificationStatus('success');
        
        // Start countdown and delay navigation to show success state
        redirectCooldown.startCooldown();
        setTimeout(() =>
        {
          void navigate(user ? ROUTES.INVENTORY : '/auth/login', { replace: true });
        }, SUCCESS_REDIRECT_DELAY);
        return;
      }
      
      // Handle API errors
      if (ApiError.isApiError(error))
      {
        // Handle different error status codes
        switch (error.statusCode)
        {
        case 401:
          // Unauthorized - session expired, redirect to login
          void navigate('/auth/login?reason=sessionExpired', { replace: true });
          return;
          
        case 404:
          // User not found
          setVerificationStatus('error');
          setErrorMessage(t('auth.errors.userNotFound'));
          break;
          
        case 429:
          // Rate limited
          setVerificationStatus('error');
          setErrorMessage(t('errors.rateLimitExceeded'));
          break;
          
        default:
        {
          // All other errors - use localized message mapping
          setVerificationStatus('error');
          const localizedMessage = getLocalizedErrorMessage(error, t);
          setErrorMessage(localizedMessage);
          break;
        }
        }
      }
      else
      {
        // Unknown error
        setVerificationStatus('error');
        setErrorMessage(t('errors.genericError'));
      }
    },
  });

  useEffect(() =>
  {
    // Only attempt verification once using ref to prevent double-firing in StrictMode
    if (hasAttemptedRef.current) return;

    if (!token)
    {
      setVerificationStatus('error');
      setErrorMessage(t('auth.verifyEmailCallback.invalidLink'));
      return;
    }

    hasAttemptedRef.current = true;
    verifyEmailMutation.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only token in dependencies, mutation is stable

  const handleRetry = () =>
  {
    void navigate('/auth/send-verification-email', { replace: true });
  };

  const handleGoToLogin = () =>
  {
    void navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {verificationStatus === 'verifying' && (
            <div className="text-center space-y-4">
              <Spinner 
                size="lg" 
                text={t('auth.verifyEmailCallback.verifying')}
                className="min-h-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                {t('auth.verifyEmailCallback.verifyingInstructions')}
              </p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center space-y-4 py-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  {t('auth.verifyEmailCallback.successTitle')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('auth.verifyEmailCallback.successMessage')}
                </p>
              </div>
              {redirectCooldown.isActive && (
                <p className="text-xs text-muted-foreground">
                  {t('auth.verifyEmailCallback.redirectingIn', { seconds: redirectCooldown.seconds })}
                </p>
              )}
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {t('auth.verifyEmailCallback.errorTitle')}
                  </h2>
                  <p className="text-sm text-foreground">
                    {errorMessage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('auth.verifyEmailCallback.errorInstructions')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full h-touch"
                >
                  {t('auth.verifyEmailCallback.requestNewLink')}
                </Button>
                <Button
                  onClick={handleGoToLogin}
                  variant="outline"
                  className="w-full h-touch"
                >
                  {t('auth.verifyEmailCallback.goToLogin')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
