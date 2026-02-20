import { apiClient } from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  getAll: () => apiClient.get<Notification[]>('/notifications').then((r) => r.data),
  markAsRead: (id: string) => apiClient.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),
  markAllAsRead: () => apiClient.patch<{ message: string }>('/notifications/read-all').then((r) => r.data),
};
