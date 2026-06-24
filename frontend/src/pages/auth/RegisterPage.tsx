import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { PageContainer } from '@/components/layout/PageContainer';

export const RegisterPage: React.FC = () =>
{
  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </PageContainer>
  );
};
