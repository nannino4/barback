import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
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
import { forgotPasswordSchema, type ForgotPasswordData } from '@/validation/auth-validations';
import { authApi } from '@/api/auth-api';
import { useI18n } from '@/hooks/useI18n';
import { AuthCard, AuthFooterLink } from '@/components/features/auth/AuthCard';
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
    <AuthCard
      title={t('auth.forgotPassword.title')}
      description={t('auth.forgotPassword.description')}
      className={className}
      footer={
        <AuthFooterLink
          text={t('auth.register.hasAccount')}
          linkText={t('auth.forgotPassword.backToLogin')}
          linkTo="/auth/login"
        />
      }
    >
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
    </AuthCard>
  );
};
