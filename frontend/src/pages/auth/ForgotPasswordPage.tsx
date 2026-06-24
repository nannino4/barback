import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm';
import { PageContainer } from '@/components/layout/PageContainer';

export const ForgotPasswordPage: React.FC = () =>
{
  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </div>
    </PageContainer>
  );
};
