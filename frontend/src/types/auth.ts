export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    isEmailVerified: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
}

export interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}