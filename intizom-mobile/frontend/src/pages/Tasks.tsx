import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Trash2, Pencil, Search, ChevronDown, Calendar, Tag } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTaskStatus, useDeleteTask, useUpdateTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PriorityBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/dates';
import { TASK_PRIORITIES } from '@/utils/constants';
import type { Task, CreateTaskDto, TaskStatus, TaskPriority } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Nom kiriting').max(120),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STATUS_COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'Bajarilmagan', color: 'bg-gray-400' },
  { key: 'in_progress', label: 'Jarayonda', color: 'bg-blue-500' },
  { key: 'done', label: 'Bajarildi', color: 'bg-emerald-500' },
];

function TaskForm({ onSubmit, loading, defaultValues }: {
  onSubmit: (data: CreateTaskDto) => void;
  loading?: boolean;
  defaultValues?: Partial<Task>;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 'medium',
      dueDate: defaultValues?.dueDate ? defaultValues.dueDate.split('T')[0] : '',
      tags: defaultValues?.tags?.join(', ') ?? '',
    },
  });

  const submit = (data: FormData) => {
    onSubmit({
      title: data.title,
      description: data.description,
      priority: data.priority as TaskPriority,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Vazifa nomi" placeholder="Nimani qilish kerak..." error={errors.title?.message} {...register('title')} />
      <Textarea label="Tavsif  " placeholder="Batafsil..." rows={3} {...register('description')} />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioritet</label>
          <select className="input-base" {...register('priority')}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <Input label="Muddat" type="date" {...register('dueDate')} />
      </div>

      <Input label="Teglar (vergul bilan)" placeholder="backend, api, urgent" leftIcon={<Tag size={14} />} {...register('tags')} />

      <Button type="submit" loading={loading} className="w-full">
        {defaultValues ? 'Yangilash' : 'Qo\'shish'}
      </Button>
    </form>
  );
}

function TaskItem({ task, view }: { task: Task; view: 'list' | 'board' }) {
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isDone = task.status === 'done';
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn('card p-4 group', view === 'board' && 'mb-2')}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => updateStatus.mutate({ id: task.id, status: isDone ? 'todo' : 'done' })}
            className="mt-0.5 shrink-0 transition-transform hover:scale-110"
          >
            {isDone
              ? <CheckCircle2 size={20} className="text-emerald-500" />
              : <Circle size={20} className="text-gray-300 dark:text-gray-600 hover:text-brand-500" />
            }
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn('text-sm font-medium', isDone && 'line-through text-gray-400')}>
                {task.title}
              </p>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditOpen(true)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <Pencil size={14} className="text-gray-400" />
                </button>
                <button onClick={() => deleteTask.mutate(task.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PriorityBadge priority={task.priority} />

              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={12} /> {formatDate(task.dueDate)}
                </span>
              )}

              {task.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-full">
                  #{tag}
                </span>
              ))}

              {task.subtasks.length > 0 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {completedSubtasks}/{task.subtasks.length} subtask
                  <ChevronDown size={12} className={cn('transition-transform', expanded && 'rotate-180')} />
                </button>
              )}
            </div>

            {/* Subtasks */}
            <AnimatePresence>
              {expanded && task.subtasks.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pl-2 border-l-2 border-gray-100 dark:border-gray-800 space-y-2">
                    {task.subtasks.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 text-xs">
                        {sub.completed
                          ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          : <Circle size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                        }
                        <span className={cn(sub.completed && 'line-through text-gray-400')}>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status selector */}
            {!isDone && (
              <div className="mt-2">
                <select
                  value={task.status}
                  onChange={(e) => updateStatus.mutate({ id: task.id, status: e.target.value as TaskStatus })}
                  className="text-xs bg-transparent text-gray-400 cursor-pointer outline-none hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <option value="todo">Bajarilmagan</option>
                  <option value="in_progress">Jarayonda</option>
                  <option value="done">Bajarildi</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Vazifani tahrirlash">
        <TaskForm
          defaultValues={task}
          loading={updateTask.isPending}
          onSubmit={(data) => {
            updateTask.mutate({ id: task.id, dto: data });
            setEditOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

export function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [view, setView] = useState<'list' | 'board'>('list');

  const filtered = tasks?.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchPrio = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchPrio;
  }) ?? [];

  const doneCount = tasks?.filter((t) => t.status === 'done').length ?? 0;
  const totalCount = tasks?.length ?? 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vazifalar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{doneCount}/{totalCount} bajarildi</p>
        </div>
        {/* View toggle */}
        <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl gap-1">
          {(['list', 'board'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                view === v ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500'
              )}
            >
              {v === 'list' ? 'Ro\'yxat' : 'Board'}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          placeholder="Qidirish..." leftIcon={<Search size={16} />}
          value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-64"
        />
        <div className="flex items-center gap-2">
          {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                filterPriority === p ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
            >
              {p === 'all' ? 'Barchasi' : TASK_PRIORITIES.find((x) => x.value === p)?.label}
            </button>
          ))}
        </div>
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <p className="text-gray-500 font-medium">Hozircha vazifa yo'q</p>
              </motion.div>
            ) : (
              filtered.map((task) => <TaskItem key={task.id} task={task} view="list" />)
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Board view */}
      {view === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
          {STATUS_COLUMNS.map(({ key, label, color }) => {
            const colTasks = filtered.filter((t) => t.status === key);
            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 min-w-[280px] md:min-w-0 snap-start shrink-0 md:shrink">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full', color)} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <AnimatePresence>
                  {colTasks.map((task) => <TaskItem key={task.id} task={task} view="board" />)}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform z-30"
        style={{ backgroundColor: '#0a9090' }}
      >
        <Plus size={26} />
      </button>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi vazifa qo'shish">
        <TaskForm
          loading={createTask.isPending}
          onSubmit={(data) => {
            createTask.mutate(data);
            setCreateOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
