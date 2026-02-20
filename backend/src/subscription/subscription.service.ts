import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, trialEndDate: true, subscriptionEndDate: true, trialStartDate: true },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');

    const now = new Date();
    const daysLeftTrial = user.trialEndDate
      ? Math.max(0, Math.ceil((user.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return { ...user, daysLeftTrial };
  }

  async upgrade(userId: string) {
    const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'ACTIVE', subscriptionEndDate },
      select: { subscriptionStatus: true, subscriptionEndDate: true },
    });
  }

  async cancel(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'CANCELLED' },
      select: { subscriptionStatus: true },
    });
  }
}
