import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineSpinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { resetPasswordSchema, type ResetPasswordData } from '@/validation/auth-form-schemas';
import { authApi } from '@/api/auth-api';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
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
  const [errorMessage, setErrorMessage] = React.useState<string>('');

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

  // Token validation mutation
  const validateTokenMutation = useMutation({
    mutationFn: (validationToken: string) => authApi.validateResetToken(validationToken),
    onError: () =>
    {
      void navigate('/auth/reset-password/error', { replace: true });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token: resetToken, password: newPassword }: { token: string; password: string }) =>
      authApi.resetPassword(resetToken, newPassword),
    onSuccess: () =>
    {
      toast.success(t('auth.resetPassword.successMessage'));
      void navigate('/auth/reset-password/success', { replace: true });
    },
    onError: (error: Error) =>
    {
      if (ApiError.isApiError(error))
      {
        // Invalid or expired token - redirect to error page
        if (error.error === 'INVALID_PASSWORD_RESET_TOKEN' || error.statusCode === 401)
        {
          void navigate('/auth/reset-password/error', { replace: true });
          return;
        }
        
        // Other errors - display declaratively
        setErrorMessage(getLocalizedErrorMessage(error, t, 'form'));
      }
      else
      {
        setErrorMessage(t('auth.resetPassword.errorMessage'));
      }
    },
  });

  // Validate token when component mounts
  React.useEffect(() =>
  {
    if (!token)
    {
      void navigate('/auth/reset-password/error', { replace: true });
      return;
    }

    validateTokenMutation.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const onSubmit = (data: ResetPasswordData) =>
  {
    if (!token) return;
    
    resetPasswordMutation.mutate({ token, password: data.password });
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
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {t('auth.resetPassword.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                            disabled={resetPasswordMutation.isPending}
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
                            disabled={resetPasswordMutation.isPending}
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
                            disabled={resetPasswordMutation.isPending}
                            className="pl-10 pr-10"
                            autoComplete="new-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={resetPasswordMutation.isPending}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-touch"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <InlineSpinner className="mr-2" />
                      {t('auth.resetPassword.updating')}
                    </>
                  ) : (
                    t('auth.resetPassword.updateButton')
                  )}
                </Button>

                {/* Error Display */}
                {errorMessage && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-destructive whitespace-pre-line flex-1">
                      {errorMessage}
                    </div>
                  </div>
                )}
              </form>
            </Form>

            {/* Back to Sign In Link */}
            <div className="text-center pt-4">
              <Link
                to="/auth/login"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('auth.resetPassword.backToSignIn')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
