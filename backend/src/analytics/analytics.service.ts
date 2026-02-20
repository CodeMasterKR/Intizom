import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ─── Dashboard stats ──────────────────────────────────────────────────────

  async getDashboardStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      habits,
      todayCompletions,
      totalTasks,
      completedTasks,
      activeGoals,
      weekCompletions,
      weekTasks,
    ] = await Promise.all([
      this.prisma.habit.findMany({ where: { userId }, select: { id: true, streak: true } }),
      this.prisma.habitCompletion.count({
        where: {
          habit: { userId },
          completedAt: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({ where: { userId, status: 'done' } }),
      this.prisma.goal.count({ where: { userId, status: 'active' } }),
      this.prisma.habitCompletion.count({
        where: { habit: { userId }, completedAt: { gte: weekAgo } },
      }),
      this.prisma.task.count({ where: { userId, status: 'done', completedAt: { gte: weekAgo } } }),
    ]);

    const maxStreak = habits.length ? Math.max(...habits.map((h) => h.streak)) : 0;
    const totalHabits = habits.length;
    const maxPossibleWeek = totalHabits * 7;
    const weeklyScore = maxPossibleWeek > 0
      ? Math.round(((weekCompletions + weekTasks) / (maxPossibleWeek + 10)) * 100)
      : 0;

    return {
      habitsCompletedToday: todayCompletions,
      totalHabits,
      tasksCompleted: completedTasks,
      totalTasks,
      activeGoals,
      weeklyScore: Math.min(weeklyScore, 100),
      currentStreak: maxStreak,
    };
  }

  // ─── Weekly data ──────────────────────────────────────────────────────────

  async getWeeklyData(userId: string) {
    const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
    const result: { day: string; habitsCompleted: number; tasksCompleted: number; score: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [habitsCompleted, tasksCompleted] = await Promise.all([
        this.prisma.habitCompletion.count({
          where: { habit: { userId }, completedAt: { gte: dayStart, lt: dayEnd } },
        }),
        this.prisma.task.count({
          where: { userId, status: 'done', completedAt: { gte: dayStart, lt: dayEnd } },
        }),
      ]);

      const totalHabits = await this.prisma.habit.count({ where: { userId } });
      const score = totalHabits > 0
        ? Math.min(Math.round(((habitsCompleted + tasksCompleted) / (totalHabits + 3)) * 100), 100)
        : 0;

      const jsDay = dayStart.getDay(); // 0=Sun, 1=Mon...
      const uzDay = jsDay === 0 ? 6 : jsDay - 1; // Uz: 0=Du, 6=Ya

      result.push({
        day: days[uzDay],
        habitsCompleted,
        tasksCompleted,
        score,
      });
    }

    return result;
  }

  // ─── Habit stats ──────────────────────────────────────────────────────────

  async getHabitStats(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      include: {
        completions: {
          orderBy: { completedAt: 'desc' },
          take: 90,
        },
      },
    });

    return habits.map((h) => ({
      habitId: h.id,
      title: h.title,
      completionRate: h.completions.length > 0
        ? Math.round((h.completions.length / 30) * 100)
        : 0,
      streak: h.streak,
      data: h.completions.map((c) => ({
        date: c.completedAt.toISOString(),
        completed: true,
      })),
    }));
  }
}
