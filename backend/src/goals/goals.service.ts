import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    milestones: { orderBy: { createdAt: 'asc' as const } },
  };

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id }, include: this.include });
    if (!goal) throw new NotFoundException('Maqsad topilmadi');
    if (goal.userId !== userId) throw new ForbiddenException();
    return goal;
  }

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        title: dto.title,
        description: dto.description,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
        color: dto.color,
        userId,
        milestones: {
          create: (dto.milestones ?? []).map((m) => ({
            title: m.title,
            dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          })),
        },
      },
      include: this.include,
    });
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    await this.findOne(id, userId);

    const { milestones: _m, ...data } = dto;

    return this.prisma.goal.update({
      where: { id },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
      include: this.include,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.goal.delete({ where: { id } });
    return { message: 'Maqsad o\'chirildi' };
  }

  // ─── Milestones ──────────────────────────────────────────────────────────

  async toggleMilestone(goalId: string, milestoneId: string, userId: string) {
    await this.findOne(goalId, userId);

    const milestone = await this.prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Bosqich topilmadi');

    await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { completed: !milestone.completed },
    });

    // Auto-update progress
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: this.include,
    });

    if (goal && goal.milestones.length > 0) {
      const completed = goal.milestones.filter((m) => m.id === milestoneId ? !milestone.completed : m.completed).length;
      const progress = Math.round((completed / goal.milestones.length) * 100);
      return this.prisma.goal.update({
        where: { id: goalId },
        data: { progress },
        include: this.include,
      });
    }

    return this.findOne(goalId, userId);
  }
}
