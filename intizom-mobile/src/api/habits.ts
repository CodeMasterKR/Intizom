import { apiClient } from './client';
import type { Habit, CreateHabitDto } from '@/types';

export interface HabitMonthRow {
  id: string;
  title: string;
  color: string;
  icon: string;
  category: string;
  streak: number;
  longestStreak: number;
  isActive: boolean;
  pausedDay: number | null;
  createdAt: string;
  completedDays: number[];
}

export interface HabitMonthData {
  year: number;
  month: number;
  daysInMonth: number;
  habits: HabitMonthRow[];
}

export const habitsApi = {
  getAll: async (): Promise<Habit[]> => {
    const { data } = await apiClient.get('/habits');
    return data;
  },

  getById: async (id: string): Promise<Habit> => {
    const { data } = await apiClient.get(`/habits/${id}`);
    return data;
  },

  create: async (dto: CreateHabitDto): Promise<Habit> => {
    const { data } = await apiClient.post('/habits', dto);
    return data;
  },

  update: async (id: string, dto: Partial<CreateHabitDto>): Promise<Habit> => {
    const { data } = await apiClient.patch(`/habits/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}`);
  },

  complete: async (id: string, note?: string): Promise<Habit> => {
    const { data } = await apiClient.post(`/habits/${id}/complete`, { note });
    return data;
  },

  uncomplete: async (id: string): Promise<Habit> => {
    const { data } = await apiClient.delete(`/habits/${id}/complete`);
    return data;
  },

  getMonth: async (year: number, month: number): Promise<HabitMonthData> => {
    const { data } = await apiClient.get('/habits/month', { params: { year, month } });
    return data;
  },

  toggleDate: async (id: string, date: string): Promise<{ day: number; completed: boolean }> => {
    const { data } = await apiClient.post(`/habits/${id}/toggle-date`, { date });
    return data;
  },

  pause: async (id: string): Promise<void> => {
    await apiClient.post(`/habits/${id}/pause`);
  },

  resume: async (id: string): Promise<void> => {
    await apiClient.post(`/habits/${id}/resume`);
  },
};
