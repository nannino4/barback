import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () =>
{
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};
