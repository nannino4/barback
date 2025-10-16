import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/spinner';
import { authApi } from '@/api/auth-api';
import { AuthCard } from '@/components/features/auth/AuthCard';
import toast from 'react-hot-toast';
import { useI18n } from '@/hooks/useI18n';

export const ForgotPasswordSentPage: React.FC = () =>
{
  const { t } = useI18n();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';
  const [isResending, setIsResending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  React.useEffect(() =>
  {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0)
    {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendEmail = async () =>
  {
    if (!email || resendCooldown > 0)
    {
      return;
    }

    setIsResending(true);

    try
    {
      await authApi.forgotPassword(email);
      toast.success(t('auth.forgotPassword.successMessage'));
      setResendCooldown(60); // 1 minute cooldown
    }
    catch
    {
      // Always show generic message for security
      toast.success(t('auth.forgotPassword.genericSuccessMessage'));
      setResendCooldown(60);
    }
    finally
    {
      setIsResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <AuthCard
          title={t('auth.forgotPasswordSent.title')}
        >
          <div className="text-center space-y-6">
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
                disabled={isResending || resendCooldown > 0}
              >
                {isResending ? (
                  <>
                    <InlineSpinner className="mr-2" />
                    {t('auth.forgotPasswordSent.resendingEmail')}
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('auth.forgotPasswordSent.resendEmailCountdown', { countdown: resendCooldown })}
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
            <div className="pt-4 border-t">
              <Link
                to="/auth/login"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('auth.forgotPasswordSent.backToSignIn')}
              </Link>
            </div>
          </div>
        </AuthCard>
      </div>
    </div>
  );
};
