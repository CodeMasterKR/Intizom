import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { goalsApi } from '@/api/goals';
import { mockGoals } from '@/api/mock';
import { QUERY_KEYS } from '@/utils/constants';
import type { CreateGoalDto, Goal } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function useGoals() {
  return useQuery({
    queryKey: QUERY_KEYS.goals,
    queryFn: USE_MOCK ? () => Promise.resolve(mockGoals) : goalsApi.getAll,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK
      ? (dto: CreateGoalDto) => {
          const goal: Goal = {
            id: String(Date.now()), ...dto, status: 'active', progress: 0,
            milestones: (dto.milestones ?? []).map((m, i) => ({ id: `m${i}`, ...m, completed: false })),
            createdAt: new Date().toISOString(), userId: '1',
          };
          return Promise.resolve(goal);
        }
      : goalsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.goals });
      toast.success('Maqsad qo\'shildi!');
    },
    onError: () => toast.error('Maqsad qo\'shishda xatolik'),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK
      ? ({ id, dto }: { id: string; dto: Partial<CreateGoalDto & { progress: number }> }) =>
          Promise.resolve({ id, ...dto } as unknown as Goal)
      : ({ id, dto }: { id: string; dto: Partial<CreateGoalDto & { progress: number }> }) =>
          goalsApi.update(id, dto),
    onMutate: async ({ id, dto }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.goals });
      const prev = qc.getQueryData<Goal[]>(QUERY_KEYS.goals);
      qc.setQueryData<Goal[]>(QUERY_KEYS.goals, (old) =>
        old?.map((g) => (g.id === id ? { ...g, progress: dto.progress ?? g.progress } : g)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.goals, ctx.prev);
      toast.error('Yangilashda xatolik');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.goals });
      toast.success('Maqsad yangilandi');
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK ? (_id: string) => Promise.resolve() : goalsApi.delete,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.goals });
      const prev = qc.getQueryData<Goal[]>(QUERY_KEYS.goals);
      qc.setQueryData<Goal[]>(QUERY_KEYS.goals, (old) => old?.filter((g) => g.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.goals, ctx.prev);
      toast.error('O\'chirishda xatolik');
    },
    onSuccess: () => toast.success('Maqsad o\'chirildi'),
  });
}

export function useToggleMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK
      ? ({ goalId }: { goalId: string; milestoneId: string }) =>
          Promise.resolve({ id: goalId } as unknown as Goal)
      : ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
          goalsApi.toggleMilestone(goalId, milestoneId),
    onMutate: async ({ goalId, milestoneId }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.goals });
      const prev = qc.getQueryData<Goal[]>(QUERY_KEYS.goals);
      qc.setQueryData<Goal[]>(QUERY_KEYS.goals, (old) =>
        old?.map((g) =>
          g.id === goalId
            ? {
                ...g,
                milestones: g.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, completed: !m.completed } : m,
                ),
              }
            : g,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.goals, ctx.prev);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.goals }),
  });
}
