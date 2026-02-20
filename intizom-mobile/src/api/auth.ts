import { apiClient } from './client';
import type { User, AuthTokens, LoginDto, RegisterDto } from '@/types';

export const authApi = {
  login: async (dto: LoginDto): Promise<{ user: User } & AuthTokens> => {
    const { data } = await apiClient.post('/auth/login', dto);
    return data;
  },

  register: async (dto: RegisterDto): Promise<{ user: User } & AuthTokens> => {
    const { data } = await apiClient.post('/auth/register', dto);
    return data;
  },

  googleLogin: async (accessToken: string): Promise<{ user: User } & AuthTokens> => {
    const { data } = await apiClient.post('/auth/google', { accessToken });
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  updateProfile: async (dto: Partial<Pick<User, 'name'>>): Promise<User> => {
    const { data } = await apiClient.patch('/users/me', dto);
    return data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await apiClient.patch('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  changePassword: async (dto: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.patch('/users/me/password', dto);
  },

  setPassword: async (newPassword: string): Promise<void> => {
    await apiClient.post('/users/me/set-password', { newPassword });
  },
};
