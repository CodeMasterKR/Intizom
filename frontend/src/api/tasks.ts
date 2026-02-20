import { apiClient } from './client';
import type { Task, CreateTaskDto, TaskStatus } from '@/types';

export const tasksApi = {
  getAll: async (status?: TaskStatus): Promise<Task[]> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get('/tasks', { params });
    return data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return data;
  },

  create: async (dto: CreateTaskDto): Promise<Task> => {
    const { data } = await apiClient.post('/tasks', dto);
    return data;
  },

  update: async (id: string, dto: Partial<CreateTaskDto & { status: TaskStatus }>): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}/status`, { status });
    return data;
  },

  addSubtask: async (taskId: string, title: string): Promise<Task> => {
    const { data } = await apiClient.post(`/tasks/${taskId}/subtasks`, { title });
    return data;
  },

  toggleSubtask: async (taskId: string, subtaskId: string): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
    return data;
  },
};
