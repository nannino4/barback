import { apiClient } from '@/api/api';
import { UserSchema, type User } from '@/types/user';

export const userApi = {
  getMe: (): Promise<User> =>
  {
    return apiClient.request<User>(
      '/users/me',
      {
        method: 'GET',
      },
      UserSchema,
    );
  },

  updateMe: (data: { firstName?: string; lastName?: string; phoneNumber?: string; timezone?: string }): Promise<User> =>
  {
    return apiClient.request<User>(
      '/users/me',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      UserSchema,
    );
  },

  uploadProfilePicture: (file: File): Promise<User> =>
  {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.request<User>(
      '/users/me/profile-picture',
      {
        method: 'PUT',
        body: formData,
      },
      UserSchema,
    );
  },
};
