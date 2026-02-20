import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Trash2, Pencil, ChevronDown, Calendar, LayoutList, LayoutGrid, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
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

const UZ_MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const UZ_WEEKDAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

const schema = z.object({
  title: z.string().min(1, 'Nom kiriting').max(120),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STATUS_COLUMNS: { key: TaskStatus; label: string; color: string; dot: string }[] = [
  { key: 'todo',        label: 'Bajarilmagan', color: 'bg-gray-400',    dot: 'bg-gray-400' },
  { key: 'in_progress', label: 'Jarayonda',    color: 'bg-blue-500',    dot: 'bg-blue-500' },
  { key: 'done',        label: 'Bajarildi',    color: 'bg-emerald-500', dot: 'bg-emerald-500' },
];


// ─── DatePickerField ──────────────────────────────────────────────────────────

function DatePickerField({ value, onChange, label }: {
  value?: string;
  onChange: (date: string | undefined) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value + 'T12:00:00') : undefined;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input-base flex items-center justify-between text-left"
      >
        <span className={cn('flex-1 min-w-0 truncate', selected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 text-sm')}>
          {selected ? `${selected.getDate()} ${UZ_MONTHS[selected.getMonth()]} ${selected.getFullYear()}` : 'Sanani tanlang'}
        </span>
        <div className="flex items-center gap-1">
          {selected && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
              className="p-0.5 hover:text-red-400 text-gray-300 transition-colors"
            >
              <X size={13} />
            </span>
          )}
          <Calendar size={15} className="text-gray-400" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — faqat mobileda */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 sm:hidden"
              onClick={() => setOpen(false)}
            />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'w-[280px] p-3 z-50',
              'bg-white dark:bg-gray-900',
              'border border-gray-200 dark:border-gray-700',
              'rounded-2xl shadow-2xl',
              'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'sm:absolute sm:top-auto sm:left-auto sm:bottom-full sm:right-0 sm:mb-1 sm:translate-x-0 sm:translate-y-0',
            )}
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(date) => {
                onChange(date ? date.toISOString().split('T')[0] : undefined);
                if (date) setOpen(false);
              }}
              weekStartsOn={1}
              formatters={{
                formatMonthCaption: (d) => `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
                formatWeekdayName: (d) => UZ_WEEKDAYS[d.getDay()],
              }}
              classNames={{
                root: 'w-full',
                months: 'w-full',
                month: 'w-full',
                month_caption: 'relative flex items-center justify-center h-9 mb-2',
                caption_label: 'text-sm font-bold text-gray-900 dark:text-gray-100',
                nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
                button_previous: 'h-9 w-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors',
                button_next: 'h-9 w-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors',
                month_grid: 'w-full border-collapse',
                weekdays: 'flex w-full',
                weekday: 'flex-1 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 pb-2',
                weeks: 'w-full space-y-1',
                week: 'flex w-full',
                day: 'flex-1 flex justify-center p-[2px]',
                day_button: 'w-full h-9 rounded-xl text-sm font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
                outside: 'opacity-25',
                disabled: 'opacity-20 pointer-events-none',
                hidden: 'invisible',
              }}
              modifiersClassNames={{
                selected: '!bg-[#0a9090] !text-white hover:!bg-[#0a9090]',
                today: '!text-[#0a9090] !font-bold dark:!text-teal-400',
              }}
            />
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TaskForm ─────────────────────────────────────────────────────────────────

function TaskForm({ onSubmit, loading, defaultValues }: {
  onSubmit: (data: CreateTaskDto) => void;
  loading?: boolean;
  defaultValues?: Partial<Task>;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? 'medium',
      dueDate: defaultValues?.dueDate ? defaultValues.dueDate.split('T')[0] : '',
    },
  });

  const dueDate = watch('dueDate');

  const submit = (data: FormData) => {
    onSubmit({
      title: data.title,
      description: data.description,
      priority: data.priority as TaskPriority,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      tags: [],
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Vazifa nomi" placeholder="Nimani qilish kerak..." error={errors.title?.message} {...register('title')} />
      <Textarea label="Tavsif" placeholder="Batafsil..." rows={3} {...register('description')} />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Muhimlik</label>
          <select className="input-base" {...register('priority')}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <DatePickerField
          label="Muddat"
          value={dueDate}
          onChange={(v) => setValue('dueDate', v ?? '')}
        />
      </div>

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
  const statusCol = STATUS_COLUMNS.find((c) => c.key === task.status);

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
          {/* Complete toggle — larger tap target */}
          <button
            onClick={() => updateStatus.mutate({ id: task.id, status: isDone ? 'todo' : 'done' })}
            className="mt-0.5 shrink-0 transition-transform active:scale-90 hover:scale-110 p-0.5 -m-0.5"
          >
            {isDone
              ? <CheckCircle2 size={22} className="text-emerald-500" />
              : <Circle size={22} className="text-gray-300 dark:text-gray-600 hover:text-brand-500" />
            }
          </button>

          <div className="flex-1 min-w-0">
            {/* Title + actions */}
            <div className="flex items-start justify-between gap-2">
              <p className={cn('text-sm font-medium leading-snug', isDone && 'line-through text-gray-400')}>
                {task.title}
              </p>
              {/* Actions: always visible on mobile, hover on desktop */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditOpen(true)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Pencil size={14} className="text-gray-400" />
                </button>
                <button
                  onClick={() => deleteTask.mutate(task.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PriorityBadge priority={task.priority} />

              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} /> {formatDate(task.dueDate)}
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

            {/* Status — styled pill selector (mobile-friendly) */}
            {!isDone && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusCol?.dot)} />
                <select
                  value={task.status}
                  onChange={(e) => updateStatus.mutate({ id: task.id, status: e.target.value as TaskStatus })}
                  className="text-xs text-gray-500 dark:text-gray-400 bg-transparent cursor-pointer outline-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
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
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [view, setView] = useState<'list' | 'board'>('list');

  const filtered = (tasks?.filter((t) =>
    filterPriority === 'all' || t.priority === filterPriority
  ) ?? []).sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-24 lg:pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Vazifalar</h1>
        </div>

        {/* View toggle — visible on all screens */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => setView('list')}
            className={cn('p-2 rounded-lg transition-all',
              view === 'list'
                ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            )}
            title="Ro'yxat"
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setView('board')}
            className={cn('p-2 rounded-lg transition-all',
              view === 'board'
                ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            )}
            title="Board"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Priority filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0',
              filterPriority === p
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
            )}
          >
            {p === 'all' ? 'Barchasi' : TASK_PRIORITIES.find((x) => x.value === p)?.label}
          </button>
        ))}
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16 flex flex-col items-center gap-2">
                <div className="text-4xl">📋</div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STATUS_COLUMNS.map(({ key, label, color }) => {
            const colTasks = filtered.filter((t) => t.status === key);
            return (
              <div
                key={key}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', color)} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <AnimatePresence>
                  {colTasks.map((task) => <TaskItem key={task.id} task={task} view="board" />)}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">Bo'sh</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-xl active:scale-90 transition-all z-30"
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
