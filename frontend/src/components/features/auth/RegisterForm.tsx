import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
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
import { registerSchema, type RegisterFormData } from '@/validation/auth-form-schemas';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { getLocalizedErrorMessage, isKnownError } from '@/lib/errors';
import { cn } from '@/lib/utils';

interface RegisterFormProps
{
    className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ className }) =>
{
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { register, isRegistering, registerError } = useAuth();
  const { t } = useI18n();

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
  
  React.useEffect(() =>
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
      <CardContent className="space-y-6">
        <Form {...form}>
          <form 
            onSubmit={(e) =>
            {
              e.preventDefault();
              void form.handleSubmit(onSubmit)(e);
            }} 
            className="space-y-4"
          >
            {/* Error Message Display */}
            {registerError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  {isKnownError(registerError)
                    ? getLocalizedErrorMessage(registerError, t)
                    : t('errors.genericError')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
                    <span className="text-muted-foreground ml-1">(Optional)</span>
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
