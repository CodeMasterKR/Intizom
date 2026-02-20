import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrincipleDto, UpdatePrincipleDto } from './dto/principle.dto';

@Injectable()
export class PrinciplesService {
  constructor(private prisma: PrismaService) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private todayStart(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private calcStreak(checks: { date: Date }[]): number {
    if (checks.length === 0) return 0;

    const sorted = [...checks].sort((a, b) => b.date.getTime() - a.date.getTime());
    const today = this.todayStart();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Must have checked today or yesterday to have an active streak
    const firstDate = new Date(sorted[0].date);
    firstDate.setHours(0, 0, 0, 0);
    if (firstDate.getTime() !== today.getTime() && firstDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(sorted[i].date);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private async enrichPrinciple(principle: any) {
    const today = this.todayStart();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayCheck, allChecks] = await Promise.all([
      this.prisma.principleCheck.findUnique({
        where: { principleId_date: { principleId: principle.id, date: today } },
      }),
      this.prisma.principleCheck.findMany({
        where: { principleId: principle.id },
        orderBy: { date: 'desc' },
        take: 365,
      }),
    ]);

    return {
      ...principle,
      checkedToday: !!todayCheck,
      streak: this.calcStreak(allChecks),
    };
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async findAll(userId: string) {
    const principles = await this.prisma.principle.findMany({
      where: { userId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return Promise.all(principles.map((p) => this.enrichPrinciple(p)));
  }

  async create(userId: string, dto: CreatePrincipleDto) {
    const count = await this.prisma.principle.count({ where: { userId } });
    const principle = await this.prisma.principle.create({
      data: { ...dto, icon: dto.icon ?? 'Star', userId, order: count },
    });
    return { ...principle, checkedToday: false, streak: 0 };
  }

  async update(id: string, userId: string, dto: UpdatePrincipleDto) {
    const existing = await this.prisma.principle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Prinsip topilmadi');
    if (existing.userId !== userId) throw new ForbiddenException();

    const principle = await this.prisma.principle.update({ where: { id }, data: dto });
    return this.enrichPrinciple(principle);
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.principle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Prinsip topilmadi');
    if (existing.userId !== userId) throw new ForbiddenException();

    await this.prisma.principle.delete({ where: { id } });
    return { message: 'Prinsip o\'chirildi' };
  }

  // ─── Check toggle ─────────────────────────────────────────────────────────

  async toggleCheck(id: string, userId: string) {
    const principle = await this.prisma.principle.findUnique({ where: { id } });
    if (!principle) throw new NotFoundException('Prinsip topilmadi');
    if (principle.userId !== userId) throw new ForbiddenException();

    const today = this.todayStart();
    const existing = await this.prisma.principleCheck.findUnique({
      where: { principleId_date: { principleId: id, date: today } },
    });

    if (existing) {
      await this.prisma.principleCheck.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.principleCheck.create({ data: { principleId: id, date: today } });
    }

    return this.enrichPrinciple(principle);
  }
}
