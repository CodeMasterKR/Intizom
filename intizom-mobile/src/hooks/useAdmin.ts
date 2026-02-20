import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi, type AdminUsersQuery } from '@/api/admin';
import type { BroadcastDto, SendNotificationDto, UpdateUserAdminDto } from '@/types';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
  });
}

export function useAdminUsers(query: AdminUsersQuery = {}) {
  return useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: () => adminApi.getUsers(query),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminApi.getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserAdminDto }) => adminApi.updateUser(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Foydalanuvchi yangilandi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Foydalanuvchi o\'chirildi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: (dto: BroadcastDto) => adminApi.broadcastNotification(dto),
    onSuccess: (data) => toast.success(data.message),
    onError: () => toast.error('Yuborishda xatolik'),
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: (dto: SendNotificationDto) => adminApi.sendNotification(dto),
    onSuccess: (data) => toast.success(data.message),
    onError: () => toast.error('Yuborishda xatolik'),
  });
}
