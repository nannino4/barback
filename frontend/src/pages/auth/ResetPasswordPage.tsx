import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineSpinner } from '@/components/ui/spinner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { resetPasswordSchema, type ResetPasswordData } from '@/validation/auth-validations';
import { authApi } from '@/api/auth-api';
import { AuthCard, AuthFooterLink } from '@/components/features/auth/AuthCard';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useI18n } from '@/hooks/useI18n';

interface PasswordRequirement
{
    key: string;
    test: (password: string) => boolean;
}

export const ResetPasswordPage: React.FC = () =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
    
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const passwordRequirements: PasswordRequirement[] = [
    {
      key: 'auth.resetPassword.requirementLength',
      test: (password) => password.length >= 8,
    },
    {
      key: 'auth.resetPassword.requirementUppercase',
      test: (password) => /[A-Z]/.test(password),
    },
    {
      key: 'auth.resetPassword.requirementLowercase',
      test: (password) => /[a-z]/.test(password),
    },
    {
      key: 'auth.resetPassword.requirementNumber',
      test: (password) => /[0-9]/.test(password),
    },
    {
      key: 'auth.resetPassword.requirementSpecial',
      test: (password) => /[^A-Za-z0-9]/.test(password),
    },
  ];

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  // Validate token when component mounts
  React.useEffect(() =>
  {
    if (!token)
    {
      void navigate('/auth/reset-password/error', { replace: true });
      return;
    }

    const validateToken = async () =>
    {
      try
      {
        await authApi.validateResetToken(token);
      }
      catch
      {
        void navigate('/auth/reset-password/error', { replace: true });
      }
    };

    void validateToken();
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordData) =>
  {
    if (!token)
    {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try
    {
      await authApi.resetPassword(token, data.password);
      toast.success(t('auth.resetPassword.successMessage'));
      void navigate('/auth/reset-password/success', { replace: true });
    }
    catch (error: unknown)
    {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('expired') || errorMessage.includes('invalid'))
      {
        void navigate('/auth/reset-password/error', { replace: true });
      }
      else
      {
        setError(t('auth.resetPassword.errorMessage'));
      }
    }
    finally
    {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) =>
  {
    e.preventDefault();
    void form.handleSubmit(onSubmit)(e);
  };

  if (!token)
  {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <AuthCard
          title={t('auth.resetPassword.title')}
          footer={
            <AuthFooterLink
              text=""
              linkText={t('auth.resetPassword.backToSignIn')}
              linkTo="/auth/login"
            />
          }
        >
          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
              {/* New Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.resetPassword.newPassword')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                          disabled={isSubmitting}
                          className="pl-10 pr-10"
                          autoComplete="new-password"
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? t('auth.resetPassword.hidePassword') : t('auth.resetPassword.showPassword')}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('auth.resetPassword.confirmPassword')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                          disabled={isSubmitting}
                          className="pl-10 pr-10"
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? t('auth.resetPassword.hidePassword') : t('auth.resetPassword.showPassword')}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Requirements */}
              {password && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t('auth.resetPassword.requirements')}
                  </p>
                  <div className="space-y-1">
                    {passwordRequirements.map((requirement) => (
                      <div
                        key={requirement.key}
                        className="flex items-center space-x-2"
                      >
                        {requirement.test(password) ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            'text-xs',
                            requirement.test(password)
                              ? 'text-success'
                              : 'text-muted-foreground',
                          )}
                        >
                          {t(requirement.key)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-touch"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <InlineSpinner className="mr-2" />
                    {t('auth.resetPassword.updating')}
                  </>
                ) : (
                  t('auth.resetPassword.updateButton')
                )}
              </Button>
            </form>
          </Form>
        </AuthCard>
      </div>
    </div>
  );
};
