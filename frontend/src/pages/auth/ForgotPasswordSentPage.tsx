import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineSpinner } from '@/components/ui/spinner';
import { PageContainer } from '@/components/layout/PageContainer';
import { authApi } from '@/api/auth-api';
import { useI18n } from '@/hooks/useI18n';
import { notify } from '@/lib/notify';
import { useCooldown } from '@/hooks/useCooldown';
import { PASSWORD_RESET_COOLDOWN_MS } from '@/constants/constants';
import { Stack } from '@/components/layout';

export const ForgotPasswordSentPage: React.FC = () =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';
  const [isResending, setIsResending] = useState(false);
  const { seconds: cooldownSeconds, isActive: isCooldownActive, startCooldown } = useCooldown(
    'password_reset_cooldown',
    PASSWORD_RESET_COOLDOWN_MS,
  );

  const handleResendEmail = async () =>
  {
    if (!email || isCooldownActive)
    {
      return;
    }

    setIsResending(true);

    try
    {
      await authApi.forgotPassword(email);
      notify.success(t('auth.forgotPassword.successMessage'));
      startCooldown();
    }
    catch
    {
      // Always show generic message for security
      notify.success(t('auth.forgotPassword.genericSuccessMessage'));
      startCooldown();
    }
    finally
    {
      setIsResending(false);
    }
  };

  const handleGoBack = () =>
  {
    void navigate(-1);
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {t('auth.forgotPasswordSent.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Stack space='md' className="text-center">
                {/* Email Icon */}
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>

                {/* Email Address */}
                {email && (
                  <p className="text-sm font-semibold">
                    {email}
                  </p>
                )}

                {/* Expiration Notice */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <p className="text-sm">
                      {t('auth.forgotPasswordSent.linkExpires')}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('auth.forgotPasswordSent.checkSpam')}
                  </p>
                </div>

                {/* Resend Email Button */}
                {email && (
                  <Button
                    onClick={() => void handleResendEmail()}
                    variant="outline"
                    className="w-full h-touch"
                    disabled={isResending || isCooldownActive}
                  >
                    {isResending ? (
                      <>
                        <InlineSpinner className="mr-2" />
                        {t('auth.forgotPasswordSent.resendingEmail')}
                      </>
                    ) : isCooldownActive ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t('auth.forgotPasswordSent.resendEmailCountdown', { countdown: cooldownSeconds })}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t('auth.forgotPasswordSent.resendEmail')}
                      </>
                    )}
                  </Button>
                )}

                {/* Back to Login Link */}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleGoBack}
                >
                  {t('common.back')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
