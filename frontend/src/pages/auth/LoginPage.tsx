import { LoginForm } from '@/components/features/auth/LoginForm';
import { PageContainer } from '@/components/layout/PageContainer';

export const LoginPage: React.FC = () =>
{
  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </PageContainer>
  );
};
