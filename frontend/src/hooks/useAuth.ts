import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/auth-api';
import type { RegisterData, RegisterFormData, LoginData } from '@/types/auth';
import type { ApiError } from '@/types/api';

export const useAuth = () =>
{
    const navigate = useNavigate();
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        login: loginToStore,
        logout,
        setLoading,
        setError,
        clearError,
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
            };
            return authApi.register(apiData);
        },
        onMutate: () =>
        {
            setLoading(true);
            clearError();
        },
        onSuccess: (response) =>
        {
            // Use user data directly from registration response
            loginToStore(response.user, response.access_token, response.refresh_token);
            toast.success('Registration successful! Please check your email to verify your account.');
            void navigate('/');
        },
        onError: (error: Error) =>
        {
            try
            {
                const apiError = JSON.parse(error.message) as ApiError;
                setError(apiError.message);
                toast.error(apiError.message);
            }
            catch
            {
                setError('Registration failed. Please try again.');
                toast.error('Registration failed. Please try again.');
            }
        },
        onSettled: () =>
        {
            setLoading(false);
        },
    });

    const loginMutation = useMutation({
        mutationFn: (data: LoginData) => authApi.login(data),
        onMutate: () =>
        {
            setLoading(true);
            clearError();
        },
        onSuccess: (response) =>
        {
            // Use user data directly from login response
            loginToStore(response.user, response.access_token, response.refresh_token);
            toast.success('Login successful!');
            void navigate('/');
        },
        onError: (error: Error) =>
        {
            try
            {
                const apiError = JSON.parse(error.message) as ApiError;
                setError(apiError.message);
                toast.error(apiError.message);
            }
            catch
            {
                setError('Login failed. Please try again.');
                toast.error('Login failed. Please try again.');
            }
        },
        onSettled: () =>
        {
            setLoading(false);
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
        toast.success('Logged out successfully');
        void navigate('/auth/login');
    };

    return {
        // State
        user,
        isAuthenticated,
        isLoading: isLoading || registerMutation.isPending || loginMutation.isPending,
        error,

        // Actions
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        clearError,

        // Mutation states
        isRegistering: registerMutation.isPending,
        isLoggingIn: loginMutation.isPending,
    };
};