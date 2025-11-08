import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/spinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { authApi } from '@/api/auth-api';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/hooks/useI18n';
import { useCooldown } from '@/hooks/useCooldown';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
import { EMAIL_RESEND_COOLDOWN_MS } from '@/lib/constants';

type SendStatus = 'idle' | 'success' | 'error';

export const SendVerificationEmailPage: React.FC = () =>
{
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useI18n();
  const { seconds: cooldownSeconds, isActive: isCooldownActive, startCooldown } = useCooldown(
    'email_verification_cooldown',
    EMAIL_RESEND_COOLDOWN_MS,
  );
  
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const email = user?.email || '';

  // Redirect if user is already verified
  useEffect(() =>
  {
    if (user?.isEmailVerified)
    {
      toast.success(t('auth.emailVerification.success'));
      void navigate('/dashboard', { replace: true });
    }
  }, [user?.isEmailVerified, navigate, t]);

  // Send verification email mutation
  const sendEmailMutation = useMutation({
    mutationFn: () => authApi.sendVerificationEmail(),
    onSuccess: () =>
    {
      setSendStatus('success');
      toast.success(t('auth.sendVerificationEmail.emailSentSuccess'));
      startCooldown();
    },
    onError: (error: Error) =>
    {
      if (!ApiError.isApiError(error))
      {
        setSendStatus('error');
        setErrorMessage(t('errors.genericError'));
        return;
      }
      
      // Handle different error status codes
      switch (error.statusCode)
      {
      case 400:
        // Email already verified - treat as success
        if (error.error === 'EMAIL_ALREADY_VERIFIED')
        {
          toast.success(t('auth.errors.emailAlreadyVerified'));
          void navigate('/dashboard', { replace: true });
          return;
        }
        // Other 400 errors fall through to default
        break;
        
      case 401:
        // Unauthorized - session expired
        toast.error(t('auth.errors.unauthorized'));
        void navigate('/auth/login', { replace: true });
        return;
        
      case 404:
        // User not found
        setSendStatus('error');
        setErrorMessage(t('auth.errors.userNotFound'));
        break;
        
      case 429:
        // Rate limited
        setSendStatus('error');
        setErrorMessage(t('errors.rateLimitExceeded'));
        startCooldown();
        break;
      }
        
      // Default: use localized message mapping
      if (sendStatus !== 'error')
      {
        setSendStatus('error');
        const localizedMessage = getLocalizedErrorMessage(error, t);
        setErrorMessage(localizedMessage);
      }
    },
  });

  // Handle manual send/resend
  const handleSendEmail = () =>
  {
    if (isCooldownActive || sendEmailMutation.isPending) return;
    
    setErrorMessage('');
    sendEmailMutation.mutate();
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {t('auth.sendVerificationEmail.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Status Messages */}
              <div className="text-center space-y-4">
                {sendStatus === 'idle' && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">
                          {t('auth.sendVerificationEmail.checkYourEmail')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('auth.sendVerificationEmail.alreadySentDuringRegistration', { email })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('auth.sendVerificationEmail.checkSpamAndResend')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {sendStatus === 'success' && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-success">
                          {t('auth.sendVerificationEmail.emailSentTitle')}
                        </p>
                        <p className="text-sm text-foreground mt-1">
                          {t('auth.sendVerificationEmail.sentTo')} <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('auth.sendVerificationEmail.clickLinkInstructions')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {sendStatus === 'error' && errorMessage && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-destructive">
                          {t('auth.sendVerificationEmail.sendFailedTitle')}
                        </p>
                        <p className="text-sm text-foreground mt-1">
                          {errorMessage}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('auth.sendVerificationEmail.tryAgainInstructions')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Send/Resend Button - Always visible */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleSendEmail}
                  variant={sendStatus === 'idle' ? 'default' : 'outline'}
                  className="w-full h-touch"
                  disabled={sendEmailMutation.isPending || isCooldownActive}
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <InlineSpinner className="mr-2" />
                      {t('auth.sendVerificationEmail.resendingEmail')}
                    </>
                  ) : isCooldownActive ? (
                    <>
                      <RefreshCw className="mr-2 w-4 h-4" />
                      {t('auth.sendVerificationEmail.resendInSeconds', { seconds: cooldownSeconds })}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 w-4 h-4" />
                      {t('auth.sendVerificationEmail.resendEmail')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
