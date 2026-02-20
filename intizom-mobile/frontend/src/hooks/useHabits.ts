import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { habitsApi, type HabitMonthData } from '@/api/habits';
import { mockHabits } from '@/api/mock';
import { QUERY_KEYS } from '@/utils/constants';
import type { CreateHabitDto, Habit } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function useHabits() {
  return useQuery({
    queryKey: QUERY_KEYS.habits,
    queryFn: USE_MOCK ? () => Promise.resolve(mockHabits) : habitsApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 daqiqa cache
    gcTime: 1000 * 60 * 30,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK
      ? (dto: CreateHabitDto) => {
          const newHabit: Habit = {
            id: String(Date.now()), ...dto, streak: 0, longestStreak: 0,
            completedToday: false, completions: [], createdAt: new Date().toISOString(), userId: '1',
          };
          return Promise.resolve(newHabit);
        }
      : habitsApi.create,
    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.habits });
      const prev = qc.getQueryData<Habit[]>(QUERY_KEYS.habits);
      const optimistic: Habit = {
        id: `temp-${Date.now()}`, ...dto, streak: 0, longestStreak: 0,
        completedToday: false, completions: [], createdAt: new Date().toISOString(), userId: '1',
      };
      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) => [...(old ?? []), optimistic]);
      return { prev };
    },
    onError: (_err, _dto, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.habits, ctx.prev);
      toast.error('Odat qo\'shishda xatolik');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.habits });
      toast.success('Odat qo\'shildi!');
    },
  });
}

export function useToggleHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      USE_MOCK
        ? Promise.resolve({ id } as unknown as Habit)
        : completed ? habitsApi.uncomplete(id) : habitsApi.complete(id),
    onMutate: async ({ id, completed }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.habits });
      const prev = qc.getQueryData<Habit[]>(QUERY_KEYS.habits);
      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) =>
        old?.map((h) =>
          h.id === id
            ? { ...h, completedToday: !completed, streak: !completed ? h.streak + 1 : Math.max(0, h.streak - 1) }
            : h,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.habits, ctx.prev);
      toast.error('Xatolik yuz berdi');
    },
    onSuccess: (_data, { completed }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
      if (!completed) toast.success('Barakalla! Odat bajarildi! 🎉');
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK ? (id: string) => Promise.resolve() : habitsApi.delete,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.habits });
      const prev = qc.getQueryData<Habit[]>(QUERY_KEYS.habits);
      qc.setQueryData<Habit[]>(QUERY_KEYS.habits, (old) => old?.filter((h) => h.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.habits, ctx.prev);
      toast.error('O\'chirishda xatolik');
    },
    onSuccess: () => toast.success('Odat o\'chirildi'),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK
      ? ({ id, dto }: { id: string; dto: Partial<CreateHabitDto> }) =>
          Promise.resolve({ id, ...dto } as unknown as Habit)
      : ({ id, dto }: { id: string; dto: Partial<CreateHabitDto> }) => habitsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.habits });
      toast.success('Odat yangilandi');
    },
    onError: () => toast.error('Yangilashda xatolik'),
  });
}

export function usePauseHabit(year: number, month: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsApi.pause(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.habitMonth(year, month) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.habits });
      toast.success('Odat to\'xtatildi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });
}

export function useResumeHabit(year: number, month: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsApi.resume(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.habitMonth(year, month) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.habits });
      toast.success('Odat davom ettirildi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });
}

export function useHabitMonth(year: number, month: number) {
  return useQuery({
    queryKey: QUERY_KEYS.habitMonth(year, month),
    queryFn: () => habitsApi.getMonth(year, month),
    staleTime: 1000 * 60 * 2,
  });
}

export function useToggleHabitDate(year: number, month: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      habitsApi.toggleDate(id, date),
    onMutate: async ({ id, date }) => {
      const key = QUERY_KEYS.habitMonth(year, month);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HabitMonthData>(key);

      const day = new Date(date).getDate();
      qc.setQueryData<HabitMonthData>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          habits: old.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completedDays: h.completedDays.includes(day)
                    ? h.completedDays.filter((d) => d !== day)
                    : [...h.completedDays, day],
                }
              : h,
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      const key = QUERY_KEYS.habitMonth(year, month);
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    },
  });
}
