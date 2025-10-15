import React from 'react';
import { LoginForm } from '@/components/features/auth/LoginForm';

export const LoginPage: React.FC = () =>
{
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-4xl font-semibold">
            Barback
          </h1>
          <p className="text-sm text-muted-foreground">
            Inventory management for cocktail bars
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
