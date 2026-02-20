import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { principlesApi } from '@/api/principles';
import { QUERY_KEYS } from '@/utils/constants';
import type { CreatePrincipleDto, Principle } from '@/types';

export function usePrinciples() {
  return useQuery({
    queryKey: QUERY_KEYS.principles,
    queryFn: principlesApi.getAll,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreatePrinciple() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: principlesApi.create,
    onMutate: async (dto: CreatePrincipleDto) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.principles });
      const prev = qc.getQueryData<Principle[]>(QUERY_KEYS.principles);
      const optimistic: Principle = {
        id: `temp-${Date.now()}`,
        ...dto,
        icon: dto.icon ?? 'Star',
        order: (prev?.length ?? 0),
        streak: 0,
        checkedToday: false,
        createdAt: new Date().toISOString(),
        userId: '',
      };
      qc.setQueryData<Principle[]>(QUERY_KEYS.principles, (old) => [...(old ?? []), optimistic]);
      return { prev };
    },
    onError: (_err, _dto, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.principles, ctx.prev);
      toast.error('Prinsip qo\'shishda xatolik');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.principles });
      toast.success('Prinsip qo\'shildi!');
    },
  });
}

export function useUpdatePrinciple() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreatePrincipleDto> }) =>
      principlesApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.principles });
      toast.success('Prinsip yangilandi');
    },
    onError: () => toast.error('Yangilashda xatolik'),
  });
}

export function useDeletePrinciple() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: principlesApi.delete,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.principles });
      const prev = qc.getQueryData<Principle[]>(QUERY_KEYS.principles);
      qc.setQueryData<Principle[]>(QUERY_KEYS.principles, (old) => old?.filter((p) => p.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.principles, ctx.prev);
      toast.error('O\'chirishda xatolik');
    },
    onSuccess: () => toast.success('Prinsip o\'chirildi'),
  });
}

export function useTogglePrincipleCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => principlesApi.toggleCheck(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.principles });
      const prev = qc.getQueryData<Principle[]>(QUERY_KEYS.principles);
      qc.setQueryData<Principle[]>(QUERY_KEYS.principles, (old) =>
        old?.map((p) =>
          p.id === id
            ? {
                ...p,
                checkedToday: !p.checkedToday,
                streak: !p.checkedToday ? p.streak + 1 : Math.max(0, p.streak - 1),
              }
            : p,
        ),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.principles, ctx.prev);
      toast.error('Xatolik yuz berdi');
    },
    onSuccess: (_data, _id) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.principles });
    },
  });
}
