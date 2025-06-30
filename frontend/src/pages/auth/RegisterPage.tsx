import React from 'react';
import { RegisterForm } from '@/components/features/auth/RegisterForm';

export const RegisterPage: React.FC = () =>
{
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="font-heading text-4xl font-semibold text-foreground">
                        Barback
                    </h1>
                    <p className="font-body text-sm text-muted-foreground">
                        Inventory management for cocktail bars
                    </p>
                </div>
                <RegisterForm />
            </div>
        </div>
    );
};
