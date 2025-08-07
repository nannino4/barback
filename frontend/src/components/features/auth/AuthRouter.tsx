import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { EmailVerificationHandler } from '@/pages/auth/EmailVerificationHandler';
import { GoogleCallbackPage } from '@/pages/auth/GoogleCallbackPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ForgotPasswordSentPage } from '@/pages/auth/ForgotPasswordSentPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ResetPasswordSuccessPage } from '@/pages/auth/ResetPasswordSuccessPage';
import { ResetPasswordErrorPage } from '@/pages/auth/ResetPasswordErrorPage';

export const AuthRouter: React.FC = () =>
{
    return (
        <Routes>
            {/* Authentication Pages */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Email Verification */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email/:token" element={<EmailVerificationHandler />} />
            
            {/* Password Reset Flow */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/forgot-password/sent" element={<ForgotPasswordSentPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reset-password/success" element={<ResetPasswordSuccessPage />} />
            <Route path="/reset-password/error" element={<ResetPasswordErrorPage />} />
            
            {/* OAuth Callbacks */}
            <Route path="/oauth/google/callback" element={<GoogleCallbackPage />} />
        </Routes>
    );
};
