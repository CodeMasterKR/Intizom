import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/authStore';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: subscriptionApi.getStatus,
  });
}

export function useUpgradeSubscription() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: subscriptionApi.upgrade,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
      updateUser({ subscriptionStatus: 'ACTIVE', subscriptionEndDate: data.subscriptionEndDate });
      toast.success('Premium obunaga o\'tdingiz!');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
      updateUser({ subscriptionStatus: 'CANCELLED' });
      toast.success('Obuna bekor qilindi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });
}
