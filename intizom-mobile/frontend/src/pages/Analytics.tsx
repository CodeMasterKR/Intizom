import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Award, Flame, Target, BarChart3 } from 'lucide-react';
import { useDashboardStats, useWeeklyData } from '@/hooks/useAnalytics';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { PageLoader } from '@/components/ui/Spinner';
import { Progress } from '@/components/ui/Progress';
import { HABIT_CATEGORIES } from '@/utils/constants';

const COLORS = ['#0a9090', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#087878', '#84cc16'];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } },
};

export function Analytics() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: weekly } = useWeeklyData();
  const { data: habits } = useHabits();
  const { data: tasks } = useTasks();
  const { data: goals } = useGoals();

  if (isLoading) return <PageLoader />;

  // Category distribution for habits
  const categoryData = HABIT_CATEGORIES.map((cat) => ({
    name: cat.label,
    value: habits?.filter((h) => h.category === cat.value).length ?? 0,
    emoji: cat.emoji,
  })).filter((c) => c.value > 0);

  // Task status pie
  const taskStatusData = [
    { name: 'Bajarildi', value: tasks?.filter((t) => t.status === 'done').length ?? 0 },
    { name: 'Jarayonda', value: tasks?.filter((t) => t.status === 'in_progress').length ?? 0 },
    { name: 'Kutilmoqda', value: tasks?.filter((t) => t.status === 'todo').length ?? 0 },
  ].filter((d) => d.value > 0);

  // Top habits by streak
  const topHabits = [...(habits ?? [])].sort((a, b) => b.streak - a.streak).slice(0, 5);

  return (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Statistika</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Sizning faolligingiz tahlili</p>
      </motion.div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Flame size={22} />, label: 'Joriy seriya', value: `${stats?.currentStreak ?? 0} kun`, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { icon: <Award size={22} />, label: 'Haftalik ball', value: `${stats?.weeklyScore ?? 0}%`, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
          { icon: <Target size={22} />, label: 'Faol maqsadlar', value: stats?.activeGoals ?? 0, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
          { icon: <BarChart3 size={22} />, label: 'Jami odat', value: stats?.totalHabits ?? 0, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950/30' },
        ].map(({ icon, label, value, color, bg }) => (
          <motion.div key={label} variants={stagger.item} className="card p-5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${bg}`}>
              <span className={color}>{icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={stagger.item} className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Haftalik faollik</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekly ?? []}>
              <defs>
                <linearGradient id="habitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a9090" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0a9090" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tasksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }} />
              <Legend />
              <Area type="monotone" dataKey="habitsCompleted" name="Odatlar" stroke="#0a9090" strokeWidth={2} fill="url(#habitsGrad)" dot={{ r: 4, fill: '#0a9090' }} />
              <Area type="monotone" dataKey="tasksCompleted" name="Vazifalar" stroke="#8b5cf6" strokeWidth={2} fill="url(#tasksGrad)" dot={{ r: 4, fill: '#8b5cf6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={stagger.item} className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-brand-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Kunlik ball</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly ?? []} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number | undefined) => [`${v ?? 0}%`, 'Ball']} />
              <Bar dataKey="score" name="Ball" radius={[8, 8, 0, 0]}>
                {(weekly ?? []).map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categoryData.length > 0 && (
          <motion.div variants={stagger.item} className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Odat kategoriyalari</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-48 shrink-0">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{cat.emoji} {cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {taskStatusData.length > 0 && (
          <motion.div variants={stagger.item} className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Vazifa holati</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-48 shrink-0">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                      {taskStatusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2">
                {taskStatusData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{s.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Top habits */}
      {topHabits.length > 0 && (
        <motion.div variants={stagger.item} className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top odatlar (seriya bo'yicha)</h3>
          <div className="space-y-3">
            {topHabits.map((habit, i) => (
              <div key={habit.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ backgroundColor: habit.color + '20' }}
                >
                  {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{habit.title}</span>
                    <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: habit.color }}>
                      🔥 {habit.streak}
                    </span>
                  </div>
                  <Progress
                    value={Math.round((habit.streak / (habit.longestStreak || 1)) * 100)}
                    color={habit.color}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Goals progress */}
      {goals && goals.length > 0 && (
        <motion.div variants={stagger.item} className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Maqsadlar progressi</h3>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{goal.title}</span>
                  <span className="text-xs font-semibold" style={{ color: goal.color }}>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} color={goal.color} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
