import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
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
import { Stack } from '@/components/layout/Stack';
import { loginSchema, type LoginFormData } from '@/types/auth-forms';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { GoogleLoginButton } from '@/components/features/auth/GoogleLoginButton';
import { getLocalizedErrorMessage, isKnownError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { ROUTES } from '@/constants/routes';

interface LoginFormProps
{
    className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className }) =>
{
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout, isLoggingIn, loginError, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) =>
  {
    login(data);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) =>
  {
    e.preventDefault();
    void form.handleSubmit(onSubmit)(e);
  };

  const handleGoToApp = () =>
  {
    void navigate(ROUTES.INVENTORY);
  };

  const handleLogout = () =>
  {
    logout();
  };

  // If user is already authenticated, show "already logged in" message
  if (isAuthenticated)
  {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {t('auth.login.title')}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Stack space="lg">
            {/* Already Logged In Info Message */}
            <Card
              variant='info'
            >
              <Stack 
                direction='horizontal'>
                <Icon 
                  variant='transparent'
                  size='sm'
                >
                  <Info className="text-info" />
                </Icon>
                <Stack>
                  <p className="text-sm font-medium text-info mb-1">
                    {t('auth.login.alreadyLoggedIn')}
                  </p>
                  <p className="text-sm text-info/80">
                    {t('auth.login.alreadyLoggedInDescription')}
                  </p>
                </Stack>
              </Stack>
            </Card>

            {/* Action Buttons */}
            <Stack>
              <Button
                onClick={handleGoToApp}
                className="w-full h-touch"
                variant="default"
              >
                {t('auth.login.goToDashboard')}
              </Button>

              <Button
                onClick={handleLogout}
                className="w-full h-touch"
                variant="outline"
              >
                {t('auth.login.signOut')}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {t('auth.login.title')}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Stack space="lg">
          {/* Google Login */}
          <GoogleLoginButton />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('auth.login.continueWith')}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={handleFormSubmit} noValidate>
              <Stack space="md">
                {/* Error Message Display */}
                {loginError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-destructive whitespace-pre-line">
                      {isKnownError(loginError)
                        ? getLocalizedErrorMessage(loginError, t, 'form')
                        : t('errors.genericError')}
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('common.email')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder={t('auth.login.emailPlaceholder')}
                          disabled={isLoggingIn}
                          autoComplete="email"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('common.password')}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('auth.login.passwordPlaceholder')}
                            disabled={isLoggingIn}
                            className="pr-10"
                            autoComplete="current-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoggingIn}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                              {showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link
                    to={ROUTES.AUTH.FORGOT_PASSWORD}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-touch"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <InlineSpinner className="mr-2" />
                      {t('auth.login.signingIn')}
                    </>
                  ) : (
                    t('auth.login.signIn')
                  )}
                </Button>
              </Stack>
            </form>
          </Form>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.login.noAccount')}{' '}
              <Link
                to="/auth/register"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('auth.login.signUp')}
              </Link>
            </p>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
};
