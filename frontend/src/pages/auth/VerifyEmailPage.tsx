import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, RefreshCw } from 'lucide-react';
import { InlineSpinner } from '@/components/ui/spinner';
import { authApi } from '@/api/auth-api';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from '@/hooks/useI18n';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthCard, AuthFooterLink } from '@/components/features/auth/AuthCard';
import type { ApiError } from '@/types/api';

interface VerifyEmailPageProps
{
    className?: string;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ className }) =>
{
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const { user } = useAuthStore();
  const { t } = useI18n();

  // Auto-populate email if user is logged in
  React.useEffect(() =>
  {
    if (user?.email)
    {
      setEmail(user.email);
    }
  }, [user]);

  // Handle email verification from URL token
  const verifyFromTokenMutation = useMutation({
    mutationFn: (token: string) => authApi.verifyEmailByUrl(token),
    onSuccess: () =>
    {
      toast.success(t('auth.emailVerification.success'));
      void navigate('/');
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
    },
  });

  // Handle resend verification email
  const resendEmailMutation = useMutation({
    mutationFn: (emailAddress: string) => authApi.resendVerificationEmail(emailAddress),
    onSuccess: () =>
    {
      toast.success('Verification email sent! Check your inbox.');
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

  // Check for token in URL params on mount
  React.useEffect(() =>
  {
    const token = searchParams.get('token');
    if (token)
    {
      verifyFromTokenMutation.mutate(token);
    }
  }, [searchParams, verifyFromTokenMutation]);

  const handleResendEmail = () =>
  {
    if (!email.trim())
    {
      toast.error(t('auth.verifyEmail.enterEmail'));
      return;
    }
    resendEmailMutation.mutate(email);
  };

  return (
    <AuthLayout 
      className={className}
    >
      <AuthCard 
        title={t('auth.verifyEmail.title')} 
        description={t('auth.verifyEmail.description')}
        footer={
          <AuthFooterLink 
            text={t('auth.verifyEmail.needToGoBack')} 
            linkText={t('auth.verifyEmail.signInInstead')} 
            linkTo="/auth/login" 
          />
        }
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="font-body text-sm text-muted-foreground">
                        Need to resend the verification email?
          </p>
        </div>

        <div className="space-y-4">
          {/* Email input for resend */}
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">
                            Email address
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-touch font-body"
              disabled={resendEmailMutation.isPending}
            />
          </div>

          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full h-touch font-body"
            disabled={resendEmailMutation.isPending || !email.trim()}
          >
            {resendEmailMutation.isPending ? (
              <>
                <InlineSpinner className="mr-2" />
                {t('auth.verifyEmail.resendingEmail')}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 w-4 h-4" />
                {t('auth.verifyEmail.resendEmail')}
              </>
            )}
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};
