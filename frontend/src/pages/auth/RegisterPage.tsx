import React from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/components/features/auth/RegisterForm';

export const RegisterPage: React.FC = () =>
{
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
};
