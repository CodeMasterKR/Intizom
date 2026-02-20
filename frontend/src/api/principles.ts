import { apiClient } from './client';
import type { Principle, CreatePrincipleDto } from '@/types';

export const principlesApi = {
  getAll: async (): Promise<Principle[]> => {
    const { data } = await apiClient.get('/principles');
    return data;
  },

  create: async (dto: CreatePrincipleDto): Promise<Principle> => {
    const { data } = await apiClient.post('/principles', dto);
    return data;
  },

  update: async (id: string, dto: Partial<CreatePrincipleDto>): Promise<Principle> => {
    const { data } = await apiClient.patch(`/principles/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/principles/${id}`);
  },

  toggleCheck: async (id: string): Promise<Principle> => {
    const { data } = await apiClient.post(`/principles/${id}/check`);
    return data;
  },
};
