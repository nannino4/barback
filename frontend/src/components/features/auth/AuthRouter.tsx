import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { SendVerificationEmailPage } from '@/pages/auth/SendVerificationEmailPage';
import { VerifyEmailCallbackPage } from '@/pages/auth/VerifyEmailCallbackPage';
import { GoogleCallbackPage } from '@/pages/auth/GoogleCallbackPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ForgotPasswordSentPage } from '@/pages/auth/ForgotPasswordSentPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ResetPasswordSuccessPage } from '@/pages/auth/ResetPasswordSuccessPage';
import { ResetPasswordErrorPage } from '@/pages/auth/ResetPasswordErrorPage';
import { ProtectedRoute } from '@/components/features/auth/ProtectedRoute';

export const AuthRouter: React.FC = () =>
{
  return (
    <Routes>
      {/* Authentication Pages */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
            
      {/* Email Verification - Protected (requires authentication) */}
      <Route
        path="/send-verification-email"
        element={
          <ProtectedRoute>
            <SendVerificationEmailPage />
          </ProtectedRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailCallbackPage />} />
            
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
