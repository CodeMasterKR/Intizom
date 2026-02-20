import { apiClient } from './client';
import type { AdminStats, AdminUser, BroadcastDto, SendNotificationDto, UpdateUserAdminDto, PaginatedResponse } from '@/types';

export interface AdminUsersQuery {
  search?: string;
  subscriptionStatus?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const adminApi = {
  getStats: () => apiClient.get<AdminStats>('/admin/stats').then((r) => r.data),

  getUsers: (query: AdminUsersQuery = {}) =>
    apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', { params: query }).then((r) => r.data),

  getUserById: (id: string) =>
    apiClient.get<AdminUser>(`/admin/users/${id}`).then((r) => r.data),

  updateUser: (id: string, dto: UpdateUserAdminDto) =>
    apiClient.patch<AdminUser>(`/admin/users/${id}`, dto).then((r) => r.data),

  deleteUser: (id: string) =>
    apiClient.delete<{ message: string }>(`/admin/users/${id}`).then((r) => r.data),

  broadcastNotification: (dto: BroadcastDto) =>
    apiClient.post<{ message: string }>('/admin/notifications/broadcast', dto).then((r) => r.data),

  sendNotification: (dto: SendNotificationDto) =>
    apiClient.post<{ message: string }>('/admin/notifications/send', dto).then((r) => r.data),
};
