/**
 * Error shape from backend API responses
 * Matches the error structure documented in API docs
 */
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string; // Backend error code (e.g., 'EMAIL_ALREADY_VERIFIED', 'INVALID_EMAIL_VERIFICATION_TOKEN')
    field?: string; // Field name for validation errors
}

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
