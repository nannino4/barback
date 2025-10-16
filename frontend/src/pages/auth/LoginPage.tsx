import React from 'react';
import { LoginForm } from '@/components/features/auth/LoginForm';

export const LoginPage: React.FC = () =>
{
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};
