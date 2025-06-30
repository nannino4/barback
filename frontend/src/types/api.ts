export interface ApiError {
    message: string;
    status: number;
    field?: string;
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
