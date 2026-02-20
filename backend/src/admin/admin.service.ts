import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserAdminDto, BroadcastNotificationDto, SendNotificationDto, AdminUsersQueryDto } from './dto/admin.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Stats ───────────────────────────────────────────────────────────────

  async getStats() {
    const [totalUsers, trialUsers, activeUsers, expiredUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { subscriptionStatus: 'TRIAL' } }),
      this.prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      this.prisma.user.count({ where: { subscriptionStatus: 'EXPIRED' } }),
    ]);

    return { totalUsers, trialUsers, activeUsers, expiredUsers, cancelledUsers: totalUsers - trialUsers - activeUsers - expiredUsers };
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  async getUsers(query: AdminUsersQueryDto) {
    const { search, subscriptionStatus, role, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (subscriptionStatus) where.subscriptionStatus = subscriptionStatus;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, name: true, email: true, avatar: true, role: true,
          subscriptionStatus: true, trialEndDate: true, subscriptionEndDate: true, createdAt: true,
          _count: { select: { habits: true, tasks: true, goals: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, avatar: true, role: true,
        subscriptionStatus: true, trialEndDate: true, subscriptionEndDate: true, createdAt: true,
        _count: { select: { habits: true, tasks: true, goals: true } },
      },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserAdminDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true, name: true, email: true, role: true,
        subscriptionStatus: true, trialEndDate: true, subscriptionEndDate: true,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Foydalanuvchi o\'chirildi' };
  }

  // ─── Notifications ───────────────────────────────────────────────────────

  async broadcastNotification(adminId: string, dto: BroadcastNotificationDto) {
    const users = await this.prisma.user.findMany({ select: { id: true } });

    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: dto.title,
        message: dto.message,
        type: (dto.type as NotificationType) ?? 'info',
        isGlobal: true,
        sentBy: adminId,
      })),
    });

    return { message: `${users.length} ta foydalanuvchiga yuborildi` };
  }

  async sendNotification(adminId: string, dto: SendNotificationDto) {
    await this.prisma.notification.createMany({
      data: dto.userIds.map((userId) => ({
        userId,
        title: dto.title,
        message: dto.message,
        type: (dto.type as NotificationType) ?? 'info',
        isGlobal: false,
        sentBy: adminId,
      })),
    });

    return { message: `${dto.userIds.length} ta foydalanuvchiga yuborildi` };
  }
}
