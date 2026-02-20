import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto, SetPasswordDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true, passwordHash: true },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    const { passwordHash, ...rest } = user;
    return { ...rest, hasPassword: !!passwordHash };
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });
  }

  async updateAvatar(userId: string, filename: string) {
    // Delete old avatar file if it was a local upload
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { avatar: true } });
    if (user?.avatar && user.avatar.startsWith('/uploads/')) {
      const oldPath = join(process.cwd(), user.avatar);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: `/uploads/avatars/${filename}` },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();

    if (!user.passwordHash) throw new UnauthorizedException('Bu akkauntda parol mavjud emas (Google akkaunt)');
    const match = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!match) throw new UnauthorizedException('Joriy parol noto\'g\'ri');

    const hash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash: hash } });
    return { message: 'Parol muvaffaqiyatli o\'zgartirildi' };
  }

  async setPassword(id: string, dto: SetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();
    if (user.passwordHash) throw new ForbiddenException('Parol allaqachon mavjud. Parolni o\'zgartirish bo\'limidan foydalaning.');

    const hash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash: hash } });
    return { message: 'Parol muvaffaqiyatli o\'rnatildi' };
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new NotFoundException('Bildirishnoma topilmadi');
    if (notification.userId !== userId) throw new ForbiddenException();
    return this.prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
  }

  async markAllNotificationsRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { message: 'Barcha bildirishnomalar o\'qildi' };
  }
}
