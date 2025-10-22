import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
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
import { forgotPasswordSchema, type ForgotPasswordData } from '@/validation/auth-form-schemas';
import { authApi } from '@/api/auth-api';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ForgotPasswordFormProps
{
    className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ className }) =>
{
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordData) =>
  {
    setIsSubmitting(true);

    try
    {
      await authApi.forgotPassword(data.email);
      toast.success(t('auth.forgotPasswordSent.description'));
      void navigate('/auth/forgot-password/sent', { 
        state: { email: data.email },
        replace: true,
      });
    }
    catch
    {
      // Always show generic message for security
      const message = t('auth.forgotPasswordSent.instructions');
      toast.success(message);
      void navigate('/auth/forgot-password/sent', { 
        state: { email: data.email },
        replace: true,
      });
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

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {t('auth.forgotPassword.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
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
                        disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <InlineSpinner className="mr-2" />
                  {t('auth.forgotPassword.sendingLink')}
                </>
              ) : (
                t('auth.forgotPassword.sendLink')
              )}
            </Button>
          </form>
        </Form>

        {/* Footer Link */}
        <div className="text-center pt-4">
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
      </CardContent>
    </Card>
  );
};
