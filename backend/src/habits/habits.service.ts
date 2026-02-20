import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto, UpdateHabitDto, CompleteHabitDto, ToggleDateDto } from './dto/habit.dto';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private tomorrow() {
    const d = this.today();
    d.setDate(d.getDate() + 1);
    return d;
  }

  private async withCompletedToday(habit: any, userId: string) {
    const completion = await this.prisma.habitCompletion.findFirst({
      where: {
        habitId: habit.id,
        habit: { userId },
        completedAt: { gte: this.today(), lt: this.tomorrow() },
      },
    });
    return { ...habit, completedToday: !!completion };
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────

  async findAll(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      include: { completions: { orderBy: { completedAt: 'desc' }, take: 30 } },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(habits.map((h) => this.withCompletedToday(h, userId)));
  }

  async findOne(id: string, userId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
      include: { completions: { orderBy: { completedAt: 'desc' }, take: 60 } },
    });
    if (!habit) throw new NotFoundException('Odat topilmadi');
    if (habit.userId !== userId) throw new ForbiddenException();
    return this.withCompletedToday(habit, userId);
  }

  async create(userId: string, dto: CreateHabitDto) {
    const habit = await this.prisma.habit.create({
      data: { ...dto, targetDays: dto.targetDays ?? [], userId },
      include: { completions: true },
    });
    return { ...habit, completedToday: false };
  }

  async update(id: string, userId: string, dto: UpdateHabitDto) {
    await this.findOne(id, userId);
    const habit = await this.prisma.habit.update({
      where: { id },
      data: dto,
      include: { completions: { orderBy: { completedAt: 'desc' }, take: 30 } },
    });
    return this.withCompletedToday(habit, userId);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.habit.delete({ where: { id } });
    return { message: 'Odat o\'chirildi' };
  }

  // ─── Complete / Uncomplete ────────────────────────────────────────────────

  async complete(id: string, userId: string, dto: CompleteHabitDto) {
    const habit = await this.findOne(id, userId);
    if ((habit as any).completedToday) return habit;

    await this.prisma.habitCompletion.create({
      data: { habitId: id, note: dto.note },
    });

    // Streak hisoblash
    const newStreak = habit.streak + 1;
    const longestStreak = Math.max(newStreak, habit.longestStreak);

    const updated = await this.prisma.habit.update({
      where: { id },
      data: { streak: newStreak, longestStreak },
      include: { completions: { orderBy: { completedAt: 'desc' }, take: 30 } },
    });

    return { ...updated, completedToday: true };
  }

  async uncomplete(id: string, userId: string) {
    const habit = await this.findOne(id, userId);

    await this.prisma.habitCompletion.deleteMany({
      where: {
        habitId: id,
        completedAt: { gte: this.today(), lt: this.tomorrow() },
      },
    });

    const newStreak = Math.max(0, habit.streak - 1);
    const updated = await this.prisma.habit.update({
      where: { id },
      data: { streak: newStreak },
      include: { completions: { orderBy: { completedAt: 'desc' }, take: 30 } },
    });

    return { ...updated, completedToday: false };
  }

  // ─── Month completions ────────────────────────────────────────────────────

  async getMonthCompletions(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Show habit if it existed during this month AND was not paused before this month
    const habits = await this.prisma.habit.findMany({
      where: {
        userId,
        createdAt: { lte: end },
        OR: [
          { isActive: true },
          { pausedAt: { gte: start } }, // paused during or after this month's start
        ],
      },
      include: {
        completions: {
          where: { completedAt: { gte: start, lte: end } },
          select: { completedAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      year,
      month,
      daysInMonth,
      habits: habits.map((h) => {
        let pausedDay: number | null = null;
        if (!h.isActive && h.pausedAt) {
          const py = h.pausedAt.getFullYear();
          const pm = h.pausedAt.getMonth() + 1;
          if (py === year && pm === month) pausedDay = h.pausedAt.getDate();
        }
        return {
          id: h.id,
          title: h.title,
          color: h.color,
          icon: h.icon,
          category: h.category,
          streak: h.streak,
          longestStreak: h.longestStreak,
          isActive: h.isActive,
          pausedDay,
          createdAt: h.createdAt.toISOString(),
          completedDays: h.completions.map((c) => new Date(c.completedAt).getDate()),
        };
      }),
    };
  }

  async pauseHabit(id: string, userId: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException('Odat topilmadi');
    if (habit.userId !== userId) throw new ForbiddenException();
    return this.prisma.habit.update({
      where: { id },
      data: { isActive: false, pausedAt: new Date() },
    });
  }

  async resumeHabit(id: string, userId: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException('Odat topilmadi');
    if (habit.userId !== userId) throw new ForbiddenException();
    return this.prisma.habit.update({
      where: { id },
      data: { isActive: true, pausedAt: null },
    });
  }

  async toggleDate(id: string, userId: string, dto: ToggleDateDto) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException('Odat topilmadi');
    if (habit.userId !== userId) throw new ForbiddenException();

    const d = new Date(dto.date);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const existing = await this.prisma.habitCompletion.findFirst({
      where: { habitId: id, completedAt: { gte: d, lt: next } },
    });

    const isToday = d.getTime() === this.today().getTime();

    if (existing) {
      await this.prisma.habitCompletion.delete({ where: { id: existing.id } });
      if (isToday) {
        await this.prisma.habit.update({
          where: { id },
          data: { streak: Math.max(0, habit.streak - 1) },
        });
      }
      return { day: d.getDate(), completed: false };
    } else {
      const completedAt = new Date(d);
      completedAt.setHours(12, 0, 0, 0);
      await this.prisma.habitCompletion.create({ data: { habitId: id, completedAt } });
      if (isToday) {
        const newStreak = habit.streak + 1;
        await this.prisma.habit.update({
          where: { id },
          data: { streak: newStreak, longestStreak: Math.max(newStreak, habit.longestStreak) },
        });
      }
      return { day: d.getDate(), completed: true };
    }
  }

  // ─── Stats ───────────────────────────────────────────────────────────────

  async getStats(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      include: { completions: { orderBy: { completedAt: 'desc' }, take: 90 } },
    });

    return habits.map((h) => ({
      habitId: h.id,
      title: h.title,
      completionRate: this.calcCompletionRate(h.completions),
      streak: h.streak,
      data: h.completions.slice(0, 30).map((c) => ({
        date: c.completedAt.toISOString(),
        completed: true,
      })),
    }));
  }

  private calcCompletionRate(completions: { completedAt: Date }[]) {
    if (completions.length === 0) return 0;
    const last30 = 30;
    return Math.round((completions.length / last30) * 100);
  }
}
