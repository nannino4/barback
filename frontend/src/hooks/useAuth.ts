import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth-api';
import type { RegisterData, LoginData } from '@/types/auth-forms';
import type { RegisterFormData } from '@/types/auth-forms';
import { useI18n } from '@/hooks/useI18n';

export const useAuth = () =>
{
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const {
    user,
    isAuthenticated,
    login: loginToStore,
    logout,
  } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: (formData: RegisterFormData) =>
    {
      // Transform form data to API data (remove confirmPassword)
      const apiData: RegisterData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
      };
      return authApi.register(apiData);
    },
    onSuccess: (response) =>
    {
      // Use user data directly from registration response
      loginToStore(response.user, response.access_token, response.refresh_token);
      toast.success(t('auth.register.success'));
            
      // Redirect to email verification page instead of home
      if (!response.user.isEmailVerified)
      {
        void navigate('/auth/send-verification-email');
      }
      else
      {
        // Check for redirect parameter after successful registration
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl)
        {
          void navigate(redirectUrl);
        }
        else
        {
          void navigate('/dashboard');
        }
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) =>
    {
      // Use user data directly from login response
      loginToStore(response.user, response.access_token, response.refresh_token);
      toast.success(t('auth.login.success'));
      
      // Check email verification status and redirect accordingly
      if (!response.user.isEmailVerified)
      {
        // User is authenticated but not verified - redirect to verify email
        void navigate('/auth/send-verification-email');
      }
      else
      {
        // User is verified - check for redirect parameter or go to dashboard
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl)
        {
          void navigate(redirectUrl);
        }
        else
        {
          void navigate('/dashboard');
        }
      }
    },
  });

  const handleRegister = (data: RegisterFormData) =>
  {
    registerMutation.mutate(data);
  };

  const handleLogin = (data: LoginData) =>
  {
    loginMutation.mutate(data);
  };

  const handleLogout = () =>
  {
    logout();
    toast.success(t('auth.logout.success'));
    void navigate('/auth/login');
  };

  return {
    // State
    user,
    isAuthenticated,

    // Actions
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,

    // Mutation states for loading indicators and error display
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    
    // Error states for declarative error display
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
};