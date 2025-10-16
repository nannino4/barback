import React from 'react';
import { RegisterForm } from '@/components/features/auth/RegisterForm';

export const RegisterPage: React.FC = () =>
{
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
};
