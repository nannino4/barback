import { apiClient } from '@/api/api';
import { UserResponseSchema, type UserResponse } from '@/types/user';

export const userApi = {
  getMe: (): Promise<UserResponse> =>
  {
    return apiClient.request<UserResponse>(
      '/users/me',
      {
        method: 'GET',
      },
      UserResponseSchema,
    );
  },

  updateMe: (data: { firstName?: string; lastName?: string; phoneNumber?: string; timezone?: string }): Promise<UserResponse> =>
  {
    return apiClient.request<UserResponse>(
      '/users/me',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      UserResponseSchema,
    );
  },

  uploadProfilePicture: (file: File): Promise<UserResponse> =>
  {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.request<UserResponse>(
      '/users/me/profile-picture',
      {
        method: 'PUT',
        body: formData,
      },
      UserResponseSchema,
    );
  },
};
