// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'ADMIN';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate: string;
  subscriptionEndDate?: string;
  createdAt: string;
  hasPassword?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type HabitCategory = 'health' | 'fitness' | 'learning' | 'mindfulness' | 'productivity' | 'social' | 'other';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays?: number[];
  color: string;
  icon: string;
  streak: number;
  longestStreak: number;
  completedToday: boolean;
  completions: HabitCompletion[];
  createdAt: string;
  userId: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
  note?: string;
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDays?: number[];
  color: string;
  icon: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  tags: string[];
  subtasks: SubTask[];
  completedAt?: string;
  createdAt: string;
  userId: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  tags?: string[];
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  progress: number;
  targetDate?: string;
  milestones: Milestone[];
  color: string;
  createdAt: string;
  userId: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  targetDate?: string;
  color: string;
  milestones?: { title: string; dueDate?: string }[];
}

// ─── Principles ──────────────────────────────────────────────────────────────

export interface Principle {
  id: string;
  title: string;
  description?: string;
  icon: string;
  order: number;
  streak: number;
  checkedToday: boolean;
  createdAt: string;
  userId: string;
}

export interface CreatePrincipleDto {
  title: string;
  description?: string;
  icon?: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  habitsCompletedToday: number;
  totalHabits: number;
  tasksCompleted: number;
  totalTasks: number;
  activeGoals: number;
  weeklyScore: number;
  currentStreak: number;
}

export interface WeeklyData {
  day: string;
  habitsCompleted: number;
  tasksCompleted: number;
  score: number;
}

export interface HabitStats {
  habitId: string;
  title: string;
  completionRate: number;
  streak: number;
  data: { date: string; completed: boolean }[];
}

// ─── Notification ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  isGlobal: boolean;
  sentBy?: string;
  createdAt: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  trialUsers: number;
  activeUsers: number;
  expiredUsers: number;
  cancelledUsers: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  trialEndDate: string;
  subscriptionEndDate?: string;
  createdAt: string;
  _count: { habits: number; tasks: number; goals: number };
}

export interface BroadcastDto {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface SendNotificationDto extends BroadcastDto {
  userIds: string[];
}

export interface UpdateUserAdminDto {
  role?: UserRole;
  subscriptionStatus?: SubscriptionStatus;
}

// ─── Subscription ────────────────────────────────────────────────────────────

export interface SubscriptionInfo {
  subscriptionStatus: SubscriptionStatus;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionEndDate?: string;
  daysLeftTrial: number;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
