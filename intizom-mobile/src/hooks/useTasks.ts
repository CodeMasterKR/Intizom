import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tasksApi } from '@/api/tasks';
import { mockTasks } from '@/api/mock';
import { QUERY_KEYS } from '@/utils/constants';
import type { CreateTaskDto, Task, TaskStatus } from '@/types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function useTasks(status?: TaskStatus) {
  return useQuery({
    queryKey: [...QUERY_KEYS.tasks, status],
    queryFn: USE_MOCK
      ? () => Promise.resolve(status ? mockTasks.filter((t) => t.status === status) : mockTasks)
      : () => tasksApi.getAll(status),
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK
      ? (dto: CreateTaskDto) => {
          const task: Task = {
            id: String(Date.now()), ...dto, status: dto.status ?? 'todo',
            tags: dto.tags ?? [], subtasks: [], createdAt: new Date().toISOString(), userId: '1',
          };
          return Promise.resolve(task);
        }
      : tasksApi.create,
    onMutate: async (dto) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const prev = qc.getQueryData<Task[]>(QUERY_KEYS.tasks);
      const optimistic: Task = {
        id: `temp-${Date.now()}`, ...dto, status: dto.status ?? 'todo',
        tags: dto.tags ?? [], subtasks: [], createdAt: new Date().toISOString(), userId: '1',
      };
      qc.setQueryData<Task[]>(QUERY_KEYS.tasks, (old) => [optimistic, ...(old ?? [])]);
      return { prev };
    },
    onError: (_err, _dto, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.tasks, ctx.prev);
      toast.error('Vazifa qo\'shishda xatolik');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      toast.success('Vazifa qo\'shildi!');
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK
      ? ({ id, status }: { id: string; status: TaskStatus }) =>
          Promise.resolve({ id, status } as unknown as Task)
      : ({ id, status }: { id: string; status: TaskStatus }) => tasksApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const prev = qc.getQueryData<Task[]>(QUERY_KEYS.tasks);
      qc.setQueryData<Task[]>(QUERY_KEYS.tasks, (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.tasks, ctx.prev);
      toast.error('Xatolik yuz berdi');
    },
    onSuccess: (_data, { status }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
      if (status === 'done') toast.success('Vazifa bajarildi! ✅');
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK ? (_id: string) => Promise.resolve() : tasksApi.delete,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const prev = qc.getQueryData<Task[]>(QUERY_KEYS.tasks);
      qc.setQueryData<Task[]>(QUERY_KEYS.tasks, (old) => old?.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.tasks, ctx.prev);
      toast.error('O\'chirishda xatolik');
    },
    onSuccess: () => toast.success('Vazifa o\'chirildi'),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: USE_MOCK
      ? ({ id, dto }: { id: string; dto: Partial<CreateTaskDto> }) =>
          Promise.resolve({ id, ...dto } as unknown as Task)
      : ({ id, dto }: { id: string; dto: Partial<CreateTaskDto> }) => tasksApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      toast.success('Vazifa yangilandi');
    },
    onError: () => toast.error('Yangilashda xatolik'),
  });
}
