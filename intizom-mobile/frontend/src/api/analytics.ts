import { apiClient } from './client';
import type { DashboardStats, WeeklyData, HabitStats } from '@/types';

export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/analytics/dashboard');
    return data;
  },

  getWeeklyData: async (): Promise<WeeklyData[]> => {
    const { data } = await apiClient.get('/analytics/weekly');
    return data;
  },

  getHabitStats: async (): Promise<HabitStats[]> => {
    const { data } = await apiClient.get('/analytics/habits');
    return data;
  },
};
