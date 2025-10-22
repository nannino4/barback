import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, RefreshCw } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/spinner';
import { authApi } from '@/api/auth-api';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/hooks/useI18n';
import type { ApiError } from '@/types/api';

const COOLDOWN_KEY = 'email_verification_cooldown';
const COOLDOWN_DURATION = 60; // seconds

export const VerifyEmailPage: React.FC = () =>
{
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useI18n();
  
  // Initialize cooldown from localStorage if it exists and is still valid
  const getInitialCooldown = (): number =>
  {
    const stored = localStorage.getItem(COOLDOWN_KEY);
    if (!stored) return 0;
    
    try
    {
      const data = JSON.parse(stored) as { expiresAt: number };
      const remaining = Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000));
      return remaining;
    }
    catch
    {
      return 0;
    }
  };
  
  const [cooldownSeconds, setCooldownSeconds] = React.useState(getInitialCooldown());

  // Email is always the user's email (since route is protected)
  const email = user?.email || '';

  // Redirect if user is already verified
  React.useEffect(() =>
  {
    if (user?.isEmailVerified)
    {
      toast.success(t('auth.emailVerification.success'));
      void navigate('/dashboard', { replace: true });
    }
  }, [user?.isEmailVerified, navigate, t]);

  // Cooldown timer effect with localStorage persistence
  React.useEffect(() =>
  {
    if (cooldownSeconds > 0)
    {
      // Save cooldown expiration to localStorage
      const expiresAt = Date.now() + (cooldownSeconds * 1000);
      localStorage.setItem(COOLDOWN_KEY, JSON.stringify({ expiresAt }));
      
      const timer = setTimeout(() =>
      {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    else
    {
      // Clear localStorage when cooldown reaches 0
      localStorage.removeItem(COOLDOWN_KEY);
    }
  }, [cooldownSeconds]);

  // Handle resend verification email
  const resendEmailMutation = useMutation({
    mutationFn: (emailAddress: string) => authApi.sendVerificationEmail(emailAddress),
    onSuccess: () =>
    {
      toast.success(t('auth.verifyEmail.emailSentSuccess'));
      setCooldownSeconds(COOLDOWN_DURATION);
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
        toast.error(t('auth.emailVerification.error'));
      }
    },
  });

  const handleResendEmail = () =>
  {
    // Email is guaranteed to exist since route is protected and user is authenticated
    resendEmailMutation.mutate(email);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t('auth.verifyEmail.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-foreground">
                {t('auth.verifyEmail.sentToEmail')} <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                {t('auth.verifyEmail.clickLinkInstructions')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('auth.verifyEmail.didntReceive')}
              </p>
            </div>

            <div className="space-y-4">
              {/* Email display - read-only since user is authenticated */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('auth.verifyEmail.emailAddress')}
                </label>
                <Input
                  type="email"
                  value={email}
                  className="h-touch"
                  disabled
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  {t('auth.verifyEmail.accountEmail')}
                </p>
              </div>

              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full h-touch"
                disabled={resendEmailMutation.isPending || cooldownSeconds > 0}
              >
                {resendEmailMutation.isPending ? (
                  <>
                    <InlineSpinner className="mr-2" />
                    {t('auth.verifyEmail.resendingEmail')}
                  </>
                ) : cooldownSeconds > 0 ? (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4" />
                    {t('auth.verifyEmail.resendInSeconds', { seconds: cooldownSeconds })}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 w-4 h-4" />
                    {t('auth.verifyEmail.resendEmail')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
