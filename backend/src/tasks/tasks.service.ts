import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, CreateSubtaskDto, TaskStatus } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private readonly include = { subtasks: { orderBy: { createdAt: 'asc' as const } } };

  async findAll(userId: string, status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: { userId, ...(status && { status }) },
      include: this.include,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: this.include });
    if (!task) throw new NotFoundException('Vazifa topilmadi');
    if (task.userId !== userId) throw new ForbiddenException();
    return task;
  }

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status ?? 'todo',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        tags: dto.tags ?? [],
        userId,
      },
      include: this.include,
    });
  }

  async update(id: string, userId: string, dto: UpdateTaskDto) {
    await this.findOne(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: this.include,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Vazifa o\'chirildi' };
  }

  async updateStatus(id: string, userId: string, dto: UpdateTaskStatusDto) {
    await this.findOne(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: {
        status: dto.status,
        completedAt: dto.status === 'done' ? new Date() : null,
      },
      include: this.include,
    });
  }

  // ─── Subtasks ─────────────────────────────────────────────────────────────

  async addSubtask(taskId: string, userId: string, dto: CreateSubtaskDto) {
    await this.findOne(taskId, userId);
    await this.prisma.subTask.create({ data: { title: dto.title, taskId } });
    return this.findOne(taskId, userId);
  }

  async toggleSubtask(taskId: string, subtaskId: string, userId: string) {
    await this.findOne(taskId, userId);
    const sub = await this.prisma.subTask.findUnique({ where: { id: subtaskId } });
    if (!sub) throw new NotFoundException('Subtask topilmadi');

    await this.prisma.subTask.update({
      where: { id: subtaskId },
      data: { completed: !sub.completed },
    });

    return this.findOne(taskId, userId);
  }
}
