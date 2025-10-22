export interface ApiError {
    message: string;
    status: number;
    field?: string;
    error?: string; // Backend error code (e.g., 'EMAIL_ALREADY_VERIFIED', 'INVALID_TOKEN')
    retryAfter?: number; // For rate limiting (429) responses
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
