import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Trash2, Pencil, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useToggleMilestone } from '@/hooks/useGoals';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Progress';
import { PageLoader } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/dates';
import { GOAL_COLORS } from '@/utils/constants';
import type { Goal, CreateGoalDto } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Nom kiriting').max(100),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  color: z.string(),
  milestones: z.array(z.object({ title: z.string().min(1), dueDate: z.string().optional() })).optional(),
});

type FormData = z.infer<typeof schema>;

function GoalForm({ onSubmit, loading, defaultValues }: {
  onSubmit: (data: CreateGoalDto) => void;
  loading?: boolean;
  defaultValues?: Partial<Goal>;
}) {
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      targetDate: defaultValues?.targetDate ? defaultValues.targetDate.split('T')[0] : '',
      color: defaultValues?.color ?? '#0a9090',
      milestones: defaultValues?.milestones?.map((m) => ({ title: m.title, dueDate: m.dueDate?.split('T')[0] })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'milestones' });
  const selectedColor = watch('color');

  const submit = (data: FormData) => {
    onSubmit({
      title: data.title,
      description: data.description,
      targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
      color: data.color,
      milestones: data.milestones?.filter((m) => m.title).map((m) => ({
        title: m.title,
        dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input label="Maqsad nomi" placeholder="Mening maqsadim..." error={errors.title?.message} {...register('title')} />
      <Textarea label="Tavsif  " rows={2} {...register('description')} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Muddat" type="date" {...register('targetDate')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rang</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {GOAL_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setValue('color', c)}
                className={cn('w-7 h-7 rounded-full transition-all', selectedColor === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110')}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bosqichlar</label>
          <button type="button" onClick={() => append({ title: '', dueDate: '' })}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium"
          >
            + Qo'shish
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input className="input-base flex-1" placeholder={`Bosqich ${index + 1}`} {...register(`milestones.${index}.title`)} />
              <input className="input-base w-36" type="date" {...register(`milestones.${index}.dueDate`)} />
              <button type="button" onClick={() => remove(index)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-red-400 shrink-0">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {defaultValues ? 'Yangilash' : 'Qo\'shish'}
      </Button>
    </form>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const toggleMilestone = useToggleMilestone();
  const [editOpen, setEditOpen] = useState(false);
  const [progressEdit, setProgressEdit] = useState(false);

  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const autoProgress = goal.milestones.length > 0
    ? Math.round((completedMilestones / goal.milestones.length) * 100)
    : goal.progress;

  return (
    <>
      <motion.div
        layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="card p-5 group"
      >
        {/* Top */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: goal.color + '20' }}>
              <Target size={20} style={{ color: goal.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{goal.title}</h3>
              {goal.targetDate && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <Calendar size={12} /> {formatDate(goal.targetDate)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditOpen(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Pencil size={14} className="text-gray-400" />
            </button>
            <button onClick={() => deleteGoal.mutate(goal.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        </div>

        {goal.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{goal.description}</p>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progress</span>
            <button onClick={() => setProgressEdit((v) => !v)} className="text-xs font-semibold" style={{ color: goal.color }}>
              {autoProgress}%
            </button>
          </div>
          {progressEdit && (
            <input type="range" min={0} max={100} value={autoProgress}
              onChange={(e) => updateGoal.mutate({ id: goal.id, dto: { progress: Number(e.target.value) } })}
              className="w-full h-1.5 rounded-full mb-2 accent-current"
              style={{ accentColor: goal.color }}
            />
          )}
          <Progress value={autoProgress} color={goal.color} size="md" />
        </div>

        {/* Milestones */}
        {goal.milestones.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Bosqichlar ({completedMilestones}/{goal.milestones.length})
            </p>
            {goal.milestones.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => toggleMilestone.mutate({ goalId: goal.id, milestoneId: milestone.id })}
                className="w-full flex items-center gap-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl transition-colors"
              >
                {milestone.completed
                  ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  : <Circle size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
                }
                <span className={cn('text-left', milestone.completed && 'line-through text-gray-400')}>
                  {milestone.title}
                </span>
                {milestone.dueDate && (
                  <span className="ml-auto text-xs text-gray-400">{formatDate(milestone.dueDate)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Maqsadni tahrirlash" size="lg">
        <GoalForm
          defaultValues={goal}
          loading={updateGoal.isPending}
          onSubmit={(data) => {
            updateGoal.mutate({ id: goal.id, dto: data });
            setEditOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

export function Goals() {
  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const [createOpen, setCreateOpen] = useState(false);

  const avgProgress = goals?.length
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Maqsadlar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            O'rtacha progress: {avgProgress}%
          </p>
        </div>
      </div>

      {/* Summary bar */}
      {goals && goals.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Umumiy progress</span>
            <span className="text-sm font-semibold text-brand-500">{avgProgress}%</span>
          </div>
          <Progress value={avgProgress} size="lg" />
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {goals?.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-gray-500 font-medium">Hozircha maqsad yo'q</p>
            <p className="text-sm text-gray-400 mt-1">Birinchi maqsadingizni qo'shing!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals?.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform z-30"
        style={{ backgroundColor: '#0a9090' }}
      >
        <Plus size={26} />
      </button>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi maqsad" size="lg">
        <GoalForm
          loading={createGoal.isPending}
          onSubmit={(data) => {
            createGoal.mutate(data);
            setCreateOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
