import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
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
import { forgotPasswordSchema, type ForgotPasswordData } from '@/types/auth-forms';
import { authApi } from '@/api/auth-api';
import { useI18n } from '@/hooks/useI18n';
import { useCooldown } from '@/hooks/useCooldown';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { PASSWORD_RESET_COOLDOWN_MS } from '@/lib/constants';

interface ForgotPasswordFormProps
{
    className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ className }) =>
{
  const navigate = useNavigate();
  const { t } = useI18n();
  const { seconds: cooldownSeconds, isActive: isCooldownActive, startCooldown } = useCooldown(
    'password_reset_cooldown',
    PASSWORD_RESET_COOLDOWN_MS,
  );

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () =>
    {
      const email = form.getValues('email');
      toast.success(t('auth.forgotPasswordSent.description'));
      startCooldown();
      void navigate('/auth/forgot-password/sent', { 
        state: { email },
        replace: true,
      });
    },
    onError: () =>
    {
      // Security: Always show success message even on error
      // This prevents email enumeration attacks
      const email = form.getValues('email');
      toast.success(t('auth.forgotPasswordSent.instructions'));
      startCooldown();
      void navigate('/auth/forgot-password/sent', { 
        state: { email },
        replace: true,
      });
    },
  });

  const onSubmit = (data: ForgotPasswordData) =>
  {
    forgotPasswordMutation.mutate(data.email);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) =>
  {
    e.preventDefault();
    void form.handleSubmit(onSubmit)(e);
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {t('auth.forgotPassword.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} noValidate>
            <Stack space="md">
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
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder={t('auth.forgotPassword.emailPlaceholder')}
                          disabled={forgotPasswordMutation.isPending}
                          className="pl-10"
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-touch"
                disabled={forgotPasswordMutation.isPending || isCooldownActive}
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <InlineSpinner className="mr-2" />
                    {t('auth.forgotPassword.sendingLink')}
                  </>
                ) : isCooldownActive ? (
                  t('auth.forgotPassword.cooldown', { seconds: cooldownSeconds })
                ) : (
                  t('auth.forgotPassword.sendLink')
                )}
              </Button>

              {/* Footer Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('auth.register.hasAccount')}{' '}
                  <Link
                    to="/auth/login"
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {t('auth.forgotPassword.backToLogin')}
                  </Link>
                </p>
              </div>
            </Stack>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
