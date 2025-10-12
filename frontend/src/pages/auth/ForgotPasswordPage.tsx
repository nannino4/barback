import React from 'react';
import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () =>
{
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-heading text-4xl font-semibold text-foreground">
            Barback
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Inventory management for cocktail bars
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};
