import { apiClient } from './client';
import type { Goal, CreateGoalDto } from '@/types';

export const goalsApi = {
  getAll: async (): Promise<Goal[]> => {
    const { data } = await apiClient.get('/goals');
    return data;
  },

  getById: async (id: string): Promise<Goal> => {
    const { data } = await apiClient.get(`/goals/${id}`);
    return data;
  },

  create: async (dto: CreateGoalDto): Promise<Goal> => {
    const { data } = await apiClient.post('/goals', dto);
    return data;
  },

  update: async (id: string, dto: Partial<CreateGoalDto & { progress: number }>): Promise<Goal> => {
    const { data } = await apiClient.patch(`/goals/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/goals/${id}`);
  },

  toggleMilestone: async (goalId: string, milestoneId: string): Promise<Goal> => {
    const { data } = await apiClient.patch(`/goals/${goalId}/milestones/${milestoneId}/toggle`);
    return data;
  },
};
