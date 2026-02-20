import { apiClient } from './client';
import type { SubscriptionInfo } from '@/types';

export const subscriptionApi = {
  getStatus: () => apiClient.get<SubscriptionInfo>('/subscription/status').then((r) => r.data),
  upgrade: () => apiClient.post<{ subscriptionStatus: string; subscriptionEndDate: string }>('/subscription/upgrade').then((r) => r.data),
  cancel: () => apiClient.post<{ subscriptionStatus: string }>('/subscription/cancel').then((r) => r.data),
};
