import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
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
import { registerSchema, type RegisterFormData } from '@/types/auth-forms';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { getLocalizedErrorMessage, isKnownError } from '@/lib/errors';
import { cn } from '@/lib/utils';

interface RegisterFormProps
{
    className?: string;
}

interface PasswordRequirement
{
  key: 'auth.register.requirementLength' 
    | 'auth.register.requirementUppercase' 
    | 'auth.register.requirementLowercase' 
    | 'auth.register.requirementNumber' 
    | 'auth.register.requirementSpecial';
  test: (password: string) => boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ className }) =>
{
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isRegistering, registerError } = useAuth();
  const { t } = useI18n();

  const passwordRequirements: PasswordRequirement[] = [
    {
      key: 'auth.register.requirementLength',
      test: (password) => password.length >= 8,
    },
    {
      key: 'auth.register.requirementUppercase',
      test: (password) => /[A-Z]/.test(password),
    },
    {
      key: 'auth.register.requirementLowercase',
      test: (password) => /[a-z]/.test(password),
    },
    {
      key: 'auth.register.requirementNumber',
      test: (password) => /[0-9]/.test(password),
    },
    {
      key: 'auth.register.requirementSpecial',
      test: (password) => /[^A-Za-z0-9]/.test(password),
    },
  ];

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Watch password field to trigger confirmPassword validation when it changes
  const passwordValue = form.watch('password');
  
  useEffect(() =>
  {
    if (form.formState.touchedFields.confirmPassword)
    {
      void form.trigger('confirmPassword');
    }
  }, [passwordValue, form]);

  const onSubmit = (data: RegisterFormData) =>
  {
    register(data);
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {t('auth.register.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={(e) =>
            {
              e.preventDefault();
              void form.handleSubmit(onSubmit)(e);
            }}
          >
            <Stack space="md">
              {/* Error Message Display */}
              {registerError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-destructive whitespace-pre-line">
                    {isKnownError(registerError)
                      ? getLocalizedErrorMessage(registerError, t, 'form')
                      : t('errors.genericError')}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('common.firstName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.register.firstNamePlaceholder')}
                        autoComplete="given-name"
                        className="h-touch"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('common.lastName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('auth.register.lastNamePlaceholder')}
                        autoComplete="family-name"
                        className="h-touch"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        type="email"
                        placeholder={t('auth.register.emailPlaceholder')}
                        autoComplete="email"
                        className="h-touch"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('common.phoneNumber')}
                      <span className="text-muted-foreground ml-1">{t('common.optional')}</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+393XXXXXXXXX"
                        autoComplete="tel"
                        className="h-touch"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.register.passwordPlaceholder')}
                          autoComplete="new-password"
                          className="h-touch pr-12"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                          <span className="sr-only">
                            {showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                          </span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    
                    {/* Password Requirements */}
                    {passwordValue && (
                      <div className="space-y-2 mt-2">
                        <p className="text-sm font-medium">
                          {t('auth.register.requirements')}
                        </p>
                        <div className="space-y-1">
                          {passwordRequirements.map((requirement) => (
                            <div
                              key={requirement.key}
                              className="flex items-center space-x-2"
                            >
                              {requirement.test(passwordValue) ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span
                                className={cn(
                                  'text-xs',
                                  requirement.test(passwordValue)
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('common.confirmPassword')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('auth.register.confirmPasswordPlaceholder')}
                          autoComplete="new-password"
                          className="h-touch pr-12"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                          </span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-touch"
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <>
                    <InlineSpinner className="mr-2" />
                    {t('auth.register.creatingAccount')}
                  </>
                ) : (
                  t('auth.register.createAccount')
                )}
              </Button>

              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  {t('auth.register.hasAccount')}{' '}
                </span>
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {t('auth.register.signIn')}
                </Link>
              </div>
            </Stack>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
