// Backend tayyor bo'lguncha mock data
import type { Habit, Task, Goal, DashboardStats, WeeklyData, User } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'Kamronbek',
  email: 'kamron@intizom.uz',
  avatar: undefined,
  role: 'USER',
  subscriptionStatus: 'TRIAL',
  trialEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockHabits: Habit[] = [
  {
    id: '1', title: 'Ertalab yugurish', description: '30 daqiqa yugurish', category: 'fitness',
    frequency: 'daily', color: '#0a9090', icon: '🏃', streak: 12, longestStreak: 25,
    completedToday: true, completions: [], createdAt: '2024-01-01T00:00:00Z', userId: '1',
  },
  {
    id: '2', title: 'Kitob o\'qish', description: 'Har kuni 20 sahifa', category: 'learning',
    frequency: 'daily', color: '#8b5cf6', icon: '📚', streak: 7, longestStreak: 30,
    completedToday: false, completions: [], createdAt: '2024-01-05T00:00:00Z', userId: '1',
  },
  {
    id: '3', title: '2L suv ichish', description: 'Kuniga 2 litr suv', category: 'health',
    frequency: 'daily', color: '#10b981', icon: '💧', streak: 5, longestStreak: 15,
    completedToday: false, completions: [], createdAt: '2024-01-10T00:00:00Z', userId: '1',
  },
  {
    id: '4', title: 'Meditatsiya', description: '10 daqiqa tinch o\'tirish', category: 'mindfulness',
    frequency: 'daily', color: '#f59e0b', icon: '🧘', streak: 3, longestStreak: 10,
    completedToday: true, completions: [], createdAt: '2024-01-15T00:00:00Z', userId: '1',
  },
  {
    id: '5', title: 'Kod yozish', description: 'Leetcode masala yechish', category: 'productivity',
    frequency: 'daily', color: '#6366f1', icon: '💻', streak: 20, longestStreak: 45,
    completedToday: false, completions: [], createdAt: '2024-01-20T00:00:00Z', userId: '1',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1', title: 'Intizom backend yozish', description: 'NestJS bilan to\'liq backend qurishId',
    priority: 'urgent', status: 'in_progress', dueDate: '2024-03-01T00:00:00Z',
    tags: ['backend', 'nestjs'], subtasks: [
      { id: 's1', title: 'Auth moduli', completed: true },
      { id: 's2', title: 'Habits API', completed: false },
      { id: 's3', title: 'Tasks API', completed: false },
    ],
    createdAt: '2024-02-01T00:00:00Z', userId: '1',
  },
  {
    id: '2', title: 'Tailwind dizayn tizimi', description: 'Komponentlarni standartlashtirish',
    priority: 'high', status: 'todo', dueDate: '2024-02-28T00:00:00Z',
    tags: ['frontend', 'ui'], subtasks: [],
    createdAt: '2024-02-05T00:00:00Z', userId: '1',
  },
  {
    id: '3', title: 'Database sxema loyihalash', priority: 'medium',
    status: 'done', tags: ['database', 'prisma'], subtasks: [],
    createdAt: '2024-01-28T00:00:00Z', userId: '1', completedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '4', title: 'API dokumentatsiya', description: 'Swagger bilan hujjatlash',
    priority: 'low', status: 'todo', tags: ['api', 'swagger'], subtasks: [],
    createdAt: '2024-02-10T00:00:00Z', userId: '1',
  },
  {
    id: '5', title: 'Unit testlar yozish', priority: 'medium',
    status: 'todo', tags: ['testing'], subtasks: [],
    createdAt: '2024-02-12T00:00:00Z', userId: '1',
  },
];

export const mockGoals: Goal[] = [
  {
    id: '1', title: 'Full Stack Developer bo\'lish', description: 'React va NestJS ni chuqur o\'rganish',
    status: 'active', progress: 65, color: '#0a9090',
    targetDate: '2024-12-31T00:00:00Z',
    milestones: [
      { id: 'm1', title: 'React o\'rganish', completed: true },
      { id: 'm2', title: 'TypeScript o\'rganish', completed: true },
      { id: 'm3', title: 'NestJS o\'rganish', completed: false },
      { id: 'm4', title: 'Portfolio loyiha', completed: false },
    ],
    createdAt: '2024-01-01T00:00:00Z', userId: '1',
  },
  {
    id: '2', title: '5 km yugurish', description: 'Har kuni yugurish orqali 5 kmga yetish',
    status: 'active', progress: 40, color: '#10b981',
    targetDate: '2024-06-01T00:00:00Z',
    milestones: [
      { id: 'm1', title: '1 km yutish', completed: true },
      { id: 'm2', title: '2 km yutish', completed: false },
      { id: 'm3', title: '5 km yutish', completed: false },
    ],
    createdAt: '2024-01-15T00:00:00Z', userId: '1',
  },
  {
    id: '3', title: '50 ta kitob o\'qish', status: 'active', progress: 24,
    color: '#8b5cf6', milestones: [],
    createdAt: '2024-01-01T00:00:00Z', userId: '1',
  },
];

export const mockDashboardStats: DashboardStats = {
  habitsCompletedToday: 2,
  totalHabits: 5,
  tasksCompleted: 1,
  totalTasks: 5,
  activeGoals: 3,
  weeklyScore: 78,
  currentStreak: 12,
};

export const mockWeeklyData: WeeklyData[] = [
  { day: 'Du', habitsCompleted: 4, tasksCompleted: 2, score: 80 },
  { day: 'Se', habitsCompleted: 3, tasksCompleted: 1, score: 60 },
  { day: 'Ch', habitsCompleted: 5, tasksCompleted: 3, score: 95 },
  { day: 'Pa', habitsCompleted: 2, tasksCompleted: 0, score: 40 },
  { day: 'Ju', habitsCompleted: 4, tasksCompleted: 2, score: 75 },
  { day: 'Sh', habitsCompleted: 3, tasksCompleted: 1, score: 55 },
  { day: 'Ya', habitsCompleted: 2, tasksCompleted: 1, score: 50 },
];
