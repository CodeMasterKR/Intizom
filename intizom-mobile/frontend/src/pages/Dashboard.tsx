import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, CheckSquare, Target, TrendingUp, Check, ArrowRight, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useDashboardStats, useWeeklyData } from '@/hooks/useAnalytics';
import { useHabits, useToggleHabit } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/ui/Spinner';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/utils/cn';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UZ_MONTHS = ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'];
const UZ_DAYS   = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];

function uzDate(d = new Date()) {
  return `${UZ_DAYS[d.getDay()]}, ${d.getDate()}-${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Xayrli tong' : h < 17 ? 'Xayrli kun' : 'Xayrli kech';
}

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = memo(({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string; bg: string;
}) => (
  <motion.div variants={stagger.item} className="card p-4 flex items-center gap-4">
    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', bg)}>
      <span className={color}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </motion.div>
));

// ─── Main ─────────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: weekly } = useWeeklyData();
  const { data: habits } = useHabits();
  const { data: tasks } = useTasks();
  const { data: goals } = useGoals();
  const toggleHabit = useToggleHabit();

  if (isLoading) return <PageLoader />;

  const todayHabits = habits ?? [];
  const pendingTasks = tasks?.filter((t) => t.status !== 'done') ?? [];

  return (
    <motion.div variants={stagger.container} initial="initial" animate="animate"
      className="space-y-5 max-w-4xl mx-auto pb-6">

      {/* ── Greeting ── */}
      <motion.div variants={stagger.item} className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{uzDate()}</p>
        </div>
        {(stats?.currentStreak ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-500 px-3 py-2 rounded-xl shrink-0">
            <Flame size={16} />
            <span className="font-bold text-sm">{stats?.currentStreak} kun</span>
          </div>
        )}
      </motion.div>

      {/* ── 4 stat cards ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={22} />} label="Bugungi odatlar"
          value={`${stats?.habitsCompletedToday ?? 0} / ${stats?.totalHabits ?? 0}`}
          sub="bajarildi" color="text-orange-500" bg="bg-orange-50 dark:bg-orange-950/30"
        />
        <StatCard
          icon={<CheckSquare size={22} />} label="Vazifalar"
          value={`${stats?.tasksCompleted ?? 0} / ${stats?.totalTasks ?? 0}`}
          sub="bajarildi" color="text-blue-500" bg="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatCard
          icon={<Target size={22} />} label="Faol maqsadlar"
          value={stats?.activeGoals ?? 0}
          sub="jarayonda" color="text-purple-500" bg="bg-purple-50 dark:bg-purple-950/30"
        />
        <StatCard
          icon={<TrendingUp size={22} />} label="Haftalik natija"
          value={`${stats?.weeklyScore ?? 0}%`}
          sub="produktivlik" color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-950/30"
        />
      </div>

      {/* ── Bugungi odatlar ── */}
      {todayHabits.length > 0 && (
        <motion.div variants={stagger.item} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Bugungi odatlar</h2>
            <Link to="/habits" className="text-xs text-brand-500 flex items-center gap-1">
              Barchasi <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-1">
            {todayHabits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit.mutate({ id: habit.id, completed: habit.completedToday })}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                  habit.completedToday
                    ? 'bg-emerald-50 dark:bg-emerald-950/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                )}
              >
                {/* Check circle */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all',
                  habit.completedToday
                    ? 'bg-emerald-500'
                    : 'border-2 border-gray-200 dark:border-gray-700',
                )}>
                  {habit.completedToday && <Check size={15} strokeWidth={3} className="text-white" />}
                </div>

                {/* Icon + title */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-lg">{habit.icon}</span>
                  <span className={cn(
                    'text-sm font-medium truncate',
                    habit.completedToday ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200',
                  )}>
                    {habit.title}
                  </span>
                </div>

                {/* Streak */}
                {habit.streak > 0 && (
                  <span className="text-xs text-orange-500 flex items-center gap-0.5 shrink-0">
                    <Flame size={12} /> {habit.streak}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Vazifalar (bajarilmaganlar) ── */}
      {pendingTasks.length > 0 && (
        <motion.div variants={stagger.item} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Kutilayotgan vazifalar
              <span className="ml-2 text-xs font-normal text-gray-400">{pendingTasks.length} ta</span>
            </h2>
            <Link to="/tasks" className="text-xs text-brand-500 flex items-center gap-1">
              Barchasi <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-1">
            {pendingTasks.slice(0, 6).map((task) => {
              const priorityColor: Record<string, string> = {
                urgent: 'bg-red-500', high: 'bg-orange-400',
                medium: 'bg-blue-400', low: 'bg-gray-300 dark:bg-gray-600',
              };
              return (
                <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', priorityColor[task.priority])} />
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{task.title}</span>
                  {task.status === 'in_progress' && (
                    <span className="text-xs text-blue-500 shrink-0 flex items-center gap-1">
                      <Zap size={11} /> Jarayonda
                    </span>
                  )}
                </div>
              );
            })}
            {pendingTasks.length > 6 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                + {pendingTasks.length - 6} ta yana
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Haftalik faollik (bar chart) ── */}
      {(weekly?.length ?? 0) > 0 && (
        <motion.div variants={stagger.item} className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Haftalik faollik</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekly ?? []} barSize={24} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.45 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-chrome)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                cursor={{ fill: 'currentColor', opacity: 0.04 }}
              />
              <Bar dataKey="habitsCompleted" name="Odatlar" fill="#0a9090" radius={[5, 5, 0, 0]} />
              <Bar dataKey="tasksCompleted" name="Vazifalar" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0a9090] inline-block" /> Odatlar
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#8b5cf6] inline-block" /> Vazifalar
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Maqsadlar progressi ── */}
      {(goals?.length ?? 0) > 0 && (
        <motion.div variants={stagger.item} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Maqsadlar</h2>
            <Link to="/goals" className="text-xs text-brand-500 flex items-center gap-1">
              Barchasi <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-4">
            {goals!.filter((g) => g.status === 'active').map((goal) => {
              const pct = goal.milestones.length > 0
                ? Math.round((goal.milestones.filter((m) => m.completed).length / goal.milestones.length) * 100)
                : goal.progress;
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{goal.title}</span>
                    <span className="text-xs font-bold ml-2 shrink-0" style={{ color: goal.color }}>{pct}%</span>
                  </div>
                  <Progress value={pct} color={goal.color} size="sm" />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
