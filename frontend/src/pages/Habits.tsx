import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, ChevronLeft, ChevronRight,
  Pencil, Trash2, Check, Pause, Play,
} from 'lucide-react';

const TEAL = '#0a9090';
const GREEN_LIGHT = '#16a34a'; // light modeda to'q yashil
const GREEN_DARK  = '#4ade80'; // dark modeda ochroq yashil

function useDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}
import {
  useHabitMonth, useToggleHabitDate,
  useCreateHabit, useDeleteHabit, useUpdateHabit,
  usePauseHabit, useResumeHabit,
} from '@/hooks/useHabits';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';
import { HABIT_CATEGORIES } from '@/utils/constants';
import type { CreateHabitDto } from '@/types';
import type { HabitMonthRow } from '@/api/habits';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ─── Constants ────────────────────────────────────────────────────────────────

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFirstActiveDay(habit: HabitMonthRow, year: number, month: number): number {
  const c = new Date(habit.createdAt);
  const cy = c.getFullYear(), cm = c.getMonth() + 1;
  if (cy > year || (cy === year && cm > month)) return 999;
  if (cy === year && cm === month) return c.getDate();
  return 1;
}

function getLastActiveDay(habit: HabitMonthRow, daysInMonth: number): number {
  if (habit.isActive) return daysInMonth;
  return habit.pausedDay ?? daysInMonth;
}


// ─── Habit form ───────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Nom kiriting').max(80),
  description: z.string().optional(),
  category: z.enum(['health', 'fitness', 'learning', 'mindfulness', 'productivity', 'social', 'other']),
});
type FormData = z.infer<typeof schema>;

function HabitForm({ onSubmit, loading, defaultValues }: {
  onSubmit: (data: CreateHabitDto) => void;
  loading?: boolean;
  defaultValues?: Partial<FormData>;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'other', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit((d) => onSubmit({ ...d, frequency: 'daily', color: TEAL, icon: '🎯' }))} className="space-y-4">
      <Input label="Odat nomi" placeholder="Kunlik yugurish..." error={errors.title?.message} {...register('title')} />
      <Input label="Tavsif  " placeholder="Qisqacha izoh..." {...register('description')} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategoriya</label>
        <select className="input-base" {...register('category')}>
          {HABIT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
        </select>
      </div>
      <Button type="submit" loading={loading} className="w-full">
        {defaultValues?.title ? 'Yangilash' : 'Qo\'shish'}
      </Button>
    </form>
  );
}

// ─── Row action menu ──────────────────────────────────────────────────────────

function RowMenu({ isActive, onEdit, onPause, onResume, onDelete }: {
  isActive: boolean;
  onEdit: () => void; onPause: () => void; onResume: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-8 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-1 min-w-[150px]">
              <button onClick={() => { onEdit(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Pencil size={13} /> Tahrirlash
              </button>
              {isActive ? (
                <button onClick={() => { onPause(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg">
                  <Pause size={13} /> To'xtatish
                </button>
              ) : (
                <button onClick={() => { onResume(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg">
                  <Play size={13} /> Davom ettirish
                </button>
              )}
              <button onClick={() => { onDelete(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
                <Trash2 size={13} /> O'chirish
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE — card list view
// ═══════════════════════════════════════════════════════════════════════════════

function MobileHabitCard({
  habit, year, month, todayDay, isCurrentMonth, daysInMonth,
  onToggle, onEdit, onPause, onResume, onDelete,
}: {
  habit: HabitMonthRow;
  year: number; month: number; todayDay: number;
  isCurrentMonth: boolean; daysInMonth: number;
  onToggle: (id: string, date: string) => void;
  onEdit: (h: HabitMonthRow) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isDark = useDark();
  const GREEN = isDark ? GREEN_DARK : GREEN_LIGHT;

  const isPaused = !habit.isActive;
  const firstDay = getFirstActiveDay(habit, year, month);
  const lastDay = getLastActiveDay(habit, daysInMonth);

  // Can toggle today?
  const canToggle = isCurrentMonth && !isPaused
    && todayDay >= firstDay && todayDay <= lastDay;

  const todayDone = habit.completedDays.includes(todayDay);
  const todayDateStr = `${year}-${String(month).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;

  // Dots: show all days of this month up to today (max 31), from firstDay
  const dotStart = Math.max(1, firstDay);
  const dotEnd = Math.min(isCurrentMonth ? todayDay : daysInMonth, lastDay);
  const dots = dotEnd >= dotStart
    ? Array.from({ length: dotEnd - dotStart + 1 }, (_, i) => {
        const d = dotStart + i;
        return { d, done: habit.completedDays.includes(d), isToday: isCurrentMonth && d === todayDay };
      })
    : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('card p-4', isPaused && 'opacity-60')}
    >
      {/* Main row */}
      <div className="flex items-center gap-3">
        {/* Title + stats */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-semibold truncate',
            isPaused ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100',
          )}>
            {habit.title}
          </p>
          {isPaused && (
            <span className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
              <Pause size={10} /> To'xtatilgan
            </span>
          )}
        </div>

        {/* TODAY toggle — large, thumb-friendly */}
        <button
          disabled={!canToggle}
          onClick={() => canToggle && onToggle(habit.id, todayDateStr)}
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90',
            !canToggle && 'opacity-30 cursor-not-allowed',
          )}
          style={{
            backgroundColor: todayDone ? GREEN : 'transparent',
            border: `2.5px solid ${todayDone ? GREEN : TEAL}`,
          }}
        >
          {todayDone
            ? <Check size={32} strokeWidth={2.5} color="white" />
            : <Check size={22} strokeWidth={2} color={TEAL} opacity={0.35} />
          }
        </button>
      </div>

      {/* Dots row — month history (clickable) */}
      {dots.length > 0 && (
        <div className="flex items-center gap-[3px] mt-3 flex-wrap">
          {dots.map(({ d, done, isToday }) => {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            return (
              <button
                key={d}
                disabled={isPaused}
                onClick={() => !isPaused && onToggle(habit.id, dateStr)}
                className={cn(
                  'rounded-sm transition-all active:scale-90',
                  isToday && 'ring-1 ring-offset-[1.5px]',
                  isPaused ? 'cursor-default' : 'cursor-pointer',
                )}
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: done ? GREEN : '#e5e7eb',
                  opacity: isToday && !done ? 0.5 : 1,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Bottom: completion count + menu */}
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-xs text-gray-400">
          {habit.completedDays.length}/{dots.length > 0 ? dots.length : daysInMonth} kun
        </span>
        <RowMenu
          isActive={habit.isActive}
          onEdit={() => onEdit(habit)}
          onPause={() => onPause(habit.id)}
          onResume={() => onResume(habit.id)}
          onDelete={() => onDelete(habit.id)}
        />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESKTOP — month grid (only today editable)
// ═══════════════════════════════════════════════════════════════════════════════

function DesktopGrid({
  habits, year, month, daysInMonth, todayDay, isCurrentMonth,
  onToggle, onEdit, onPause, onResume, onDelete,
}: {
  habits: HabitMonthRow[];
  year: number; month: number; daysInMonth: number;
  todayDay: number; isCurrentMonth: boolean;
  onToggle: (id: string, date: string) => void;
  onEdit: (h: HabitMonthRow) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isDark = useDark();
  const GREEN = isDark ? GREEN_DARK : GREEN_LIGHT;

  return (
    <div className="card overflow-hidden">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 200 }} />
          {Array.from({ length: daysInMonth }, (_, i) => <col key={i} />)}
          <col style={{ width: 36 }} />
        </colgroup>

        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-800">
            <th className="text-left py-3 pl-4 pr-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Odat</span>
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isToday = isCurrentMonth && day === todayDay;
              const isFuture = isCurrentMonth && day > todayDay;
              return (
                <th key={day} className="py-3 px-0">
                  <div className={cn('flex flex-col items-center gap-0.5', isFuture && 'opacity-30')}>
                    <span className={cn('text-[10px] font-semibold leading-none', isToday ? 'text-[#0a9090]' : 'text-gray-400')}>
                      {day}
                    </span>
                    {isToday && <span className="w-1 h-1 rounded-full" style={{ backgroundColor: TEAL }} />}
                  </div>
                </th>
              );
            })}
            <th />
          </tr>
        </thead>

        <tbody>
          {habits.map((habit) => {
            const isPaused = !habit.isActive;
            const firstDay = getFirstActiveDay(habit, year, month);
            const lastDay = getLastActiveDay(habit, daysInMonth);

            return (
              <tr key={habit.id} className="group border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors">
                {/* Habit name */}
                <td className="pl-4 pr-2 py-2">
                  <p className={cn('text-sm font-medium truncate',
                    isPaused ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200')}>
                    {habit.title}
                  </p>
                  {isPaused && (
                    <span className="text-[10px] text-amber-500">To'xtatilgan</span>
                  )}
                </td>

                {/* Day cells — past & today clickable */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isToday = isCurrentMonth && day === todayDay;
                  const isFuture = isCurrentMonth && day > todayDay;
                  const isBeforeCreation = day < firstDay;
                  const isAfterPause = day > lastDay;
                  const disabled = isFuture || isBeforeCreation || isAfterPause || isPaused;
                  const completed = habit.completedDays.includes(day);
                  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isInactive = isFuture || isBeforeCreation || isAfterPause;

                  return (
                    <td key={day} className="py-2 px-0 text-center">
                      <button
                        disabled={disabled}
                        onClick={() => onToggle(habit.id, dateStr)}
                        className={cn(
                          'mx-auto flex items-center justify-center transition-all duration-150',
                          disabled ? 'cursor-default' : 'cursor-pointer active:scale-90 hover:opacity-75',
                          isToday && !completed && !isPaused && 'ring-1 ring-offset-1',
                        )}
                        style={{
                          width: '78%', aspectRatio: '1',
                          minWidth: 18, maxWidth: 28,
                          borderRadius: 6,
                          backgroundColor: completed ? GREEN : 'transparent',
                          border: completed ? 'none' : isInactive ? 'none' : isToday ? `2px solid ${TEAL}80` : `1.5px solid ${TEAL}30`,
                          opacity: isInactive && !completed ? 0.15 : isPaused && !completed ? 0.2 : 1,
                        }}
                      >
                        {completed && (
                          <Check size={14} strokeWidth={3} color="white" />
                        )}
                      </button>
                    </td>
                  );
                })}

                {/* Actions */}
                <td className="pr-2 py-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <RowMenu
                      isActive={habit.isActive}
                      onEdit={() => onEdit(habit)}
                      onPause={() => onPause(habit.id)}
                      onResume={() => onResume(habit.id)}
                      onDelete={() => onDelete(habit.id)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🌱</div>
      <p className="font-semibold text-gray-700 dark:text-gray-300">Hali odat yo'q</p>
      <p className="text-sm text-gray-400 mt-1">Birinchi odatingizni qo'shing!</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export function Habits() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [createOpen, setCreateOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<HabitMonthRow | null>(null);

  const { data, isLoading } = useHabitMonth(year, month);
  const toggleDate = useToggleHabitDate(year, month);
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const updateHabit = useUpdateHabit();
  const pauseHabit = usePauseHabit(year, month);
  const resumeHabit = useResumeHabit(year, month);

  const habits = data?.habits ?? [];
  const daysInMonth = data?.daysInMonth ?? 30;
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isCurrentMonth) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const handleToggle = (id: string, date: string) => toggleDate.mutate({ id, date });
  const handleEdit = setEditHabit;
  const handlePause = (id: string) => pauseHabit.mutate(id);
  const handleResume = (id: string) => resumeHabit.mutate(id);
  const handleDelete = (id: string) => deleteHabit.mutate(id);

  // Today's summary for mobile header
  const todayActive = habits.filter(h => h.isActive
    && getFirstActiveDay(h, year, month) <= todayDay
    && getLastActiveDay(h, daysInMonth) >= todayDay);
  const todayDone = todayActive.filter(h => h.completedDays.includes(todayDay)).length;

  if (isLoading) return <PageLoader />;

  const sharedProps = {
    year, month, daysInMonth, todayDay, isCurrentMonth,
    onToggle: handleToggle, onEdit: handleEdit,
    onPause: handlePause, onResume: handleResume, onDelete: handleDelete,
  };

  return (
    <div className="space-y-4 max-w-full pb-20 lg:pb-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth}
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center min-w-[130px]">
            <p className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
              {UZ_MONTHS[month - 1]} {year}
            </p>
          </div>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={18} />
          </button>
        </div>

      </div>

      {/* ── Mobile today summary ── */}
      {isCurrentMonth && habits.length > 0 && (
        <div className="lg:hidden card p-4 flex items-center gap-4">
          {/* Circle progress */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5"
                className="text-gray-100 dark:text-gray-800" />
              <circle cx="28" cy="28" r="22" fill="none" stroke="#0a9090" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - todayDone / (todayActive.length || 1))}`}
                className="transition-all duration-500" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-gray-100">
              {todayDone}/{todayActive.length}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {todayDone === todayActive.length && todayActive.length > 0
                ? 'Hammasi bajarildi! 🎉'
                : `${todayActive.length - todayDone} ta qoldi`}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">Bugungi odatlar</p>
          </div>
        </div>
      )}

      {/* ── Grid / Cards ── */}
      {habits.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="lg:hidden space-y-3">
            {habits.map(habit => (
              <MobileHabitCard key={habit.id} habit={habit} {...sharedProps} />
            ))}
          </div>

          {/* Desktop: month grid */}
          <div className="hidden lg:block">
            <DesktopGrid habits={habits} {...sharedProps} />
          </div>
        </>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform z-30"
        style={{ backgroundColor: '#0a9090' }}
      >
        <Plus size={26} />
      </button>

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi odat qo'shish">
        <HabitForm
          loading={createHabit.isPending}
          onSubmit={(dto) => { createHabit.mutate(dto); setCreateOpen(false); }}
        />
      </Modal>

      <Modal open={!!editHabit} onClose={() => setEditHabit(null)} title="Odatni tahrirlash">
        {editHabit && (
          <HabitForm
            defaultValues={editHabit as any}
            loading={updateHabit.isPending}
            onSubmit={(dto) => {
              updateHabit.mutate({ id: editHabit.id, dto });
              setEditHabit(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
