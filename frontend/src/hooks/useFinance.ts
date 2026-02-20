import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financeApi, type Transaction, type CreateTransactionDto } from '@/api/finance';
import { QUERY_KEYS } from '@/utils/constants';

export function useTransactions(year: number, month: number) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(year, month),
    queryFn: () => financeApi.getTransactions(year, month),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateTransaction(year: number, month: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTransactionDto) => financeApi.create(dto),
    onMutate: async (dto) => {
      const key = QUERY_KEYS.transactions(year, month);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Transaction[]>(key);
      const optimistic: Transaction = {
        id: `temp-${Date.now()}`,
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: '',
      };
      qc.setQueryData<Transaction[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { prev };
    },
    onError: (_err, _dto, ctx) => {
      const key = QUERY_KEYS.transactions(year, month);
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      toast.error('Tranzaksiya qo\'shishda xatolik');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.transactions(year, month) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.financeStats(year) });
      toast.success('Tranzaksiya qo\'shildi!');
    },
  });
}

export function useUpdateTransaction(year: number, month: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateTransactionDto> }) =>
      financeApi.update(id, dto),
    onMutate: async ({ id, dto }) => {
      const key = QUERY_KEYS.transactions(year, month);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Transaction[]>(key);
      qc.setQueryData<Transaction[]>(key, (old) =>
        old?.map((tx) => (tx.id === id ? { ...tx, ...dto } : tx)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      const key = QUERY_KEYS.transactions(year, month);
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      toast.error('Yangilashda xatolik');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.transactions(year, month) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.financeStats(year) });
      toast.success('Tranzaksiya yangilandi');
    },
  });
}

export function useDeleteTransaction(year: number, month: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.delete(id),
    onMutate: async (id) => {
      const key = QUERY_KEYS.transactions(year, month);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Transaction[]>(key);
      qc.setQueryData<Transaction[]>(key, (old) => old?.filter((tx) => tx.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      const key = QUERY_KEYS.transactions(year, month);
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      toast.error('O\'chirishda xatolik');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.financeStats(year) });
      toast.success('Tranzaksiya o\'chirildi');
    },
  });
}

export function useFinanceStats(year: number) {
  return useQuery({
    queryKey: QUERY_KEYS.financeStats(year),
    queryFn: () => financeApi.getStats(year),
    staleTime: 1000 * 60 * 5,
  });
}
