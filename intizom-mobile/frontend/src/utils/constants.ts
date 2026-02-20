import type { HabitCategory, TaskPriority, TaskStatus } from '@/types';
import type { TransactionCategory, TransactionType } from '@/api/finance';

export const HABIT_CATEGORIES: { value: HabitCategory; label: string; emoji: string }[] = [
  { value: 'health', label: 'Sog\'liq', emoji: '🍎' },
  { value: 'fitness', label: 'Sport', emoji: '💪' },
  { value: 'learning', label: 'O\'qish', emoji: '📚' },
  { value: 'mindfulness', label: 'Meditatsiya', emoji: '🧘' },
  { value: 'productivity', label: 'Produktivlik', emoji: '⚡' },
  { value: 'social', label: 'Ijtimoiy', emoji: '🤝' },
  { value: 'other', label: 'Boshqa', emoji: '✨' },
];

export const HABIT_COLORS = [
  '#0a9090', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1',
];

export const HABIT_ICONS = [
  '🏃', '📚', '💧', '🧘', '💪', '🍎', '😴', '✍️',
  '🎯', '🎨', '🎵', '🌱', '💊', '🧹', '📝', '🏋️',
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Past', color: 'text-gray-500' },
  { value: 'medium', label: 'O\'rta', color: 'text-blue-500' },
  { value: 'high', label: 'Yuqori', color: 'text-orange-500' },
  { value: 'urgent', label: 'Shoshilinch', color: 'text-red-500' },
];

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'Bajarilmagan' },
  { value: 'in_progress', label: 'Jarayonda' },
  { value: 'done', label: 'Bajarildi' },
];

export const GOAL_COLORS = [
  '#0a9090', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#f97316', '#6366f1',
];

export const DAYS_UZ = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
export const MONTHS_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

export const QUERY_KEYS = {
  user: ['user'],
  habits: ['habits'],
  habitById: (id: string) => ['habits', id],
  tasks: ['tasks'],
  taskById: (id: string) => ['tasks', id],
  goals: ['goals'],
  goalById: (id: string) => ['goals', id],
  analytics: ['analytics'],
  dashboardStats: ['analytics', 'dashboard'],
  weeklyData: ['analytics', 'weekly'],
  notifications: ['notifications'],
  habitMonth: (year: number, month: number) => ['habits', 'month', year, month],
  transactions: (year: number, month: number) => ['finance', 'transactions', year, month],
  financeStats: (year: number) => ['finance', 'stats', year],
  principles: ['principles'],
} as const;

export const FINANCE_CATEGORIES: {
  value: TransactionCategory;
  label: string;
  emoji: string;
  type: TransactionType;
}[] = [
  // Daromad
  { value: 'salary',       label: 'Maosh',         emoji: '💼', type: 'income' },
  { value: 'freelance',    label: 'Frilanс',        emoji: '💻', type: 'income' },
  { value: 'investment',   label: 'Investitsiya',   emoji: '📈', type: 'income' },
  { value: 'gift',         label: 'Sovg\'a',        emoji: '🎁', type: 'income' },
  { value: 'other_income', label: 'Boshqa daromad', emoji: '💰', type: 'income' },
  // Xarajat
  { value: 'food',          label: 'Oziq-ovqat',    emoji: '🍔', type: 'expense' },
  { value: 'transport',     label: 'Transport',     emoji: '🚗', type: 'expense' },
  { value: 'housing',       label: 'Uy-joy',        emoji: '🏠', type: 'expense' },
  { value: 'health',        label: 'Sog\'liq',      emoji: '💊', type: 'expense' },
  { value: 'education',     label: 'Ta\'lim',       emoji: '📚', type: 'expense' },
  { value: 'entertainment', label: 'Ko\'ngil ochar',emoji: '🎮', type: 'expense' },
  { value: 'shopping',      label: 'Xarid',         emoji: '🛍️', type: 'expense' },
  { value: 'utilities',     label: 'Kommunal',      emoji: '💡', type: 'expense' },
  { value: 'other_expense', label: 'Boshqa xarajat',emoji: '📋', type: 'expense' },
];
