import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/finance.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getTransactions(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('Tranzaksiya topilmadi');
    if (tx.userId !== userId) throw new ForbiddenException();

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('Tranzaksiya topilmadi');
    if (tx.userId !== userId) throw new ForbiddenException();

    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Tranzaksiya o\'chirildi' };
  }

  async getStats(userId: string, year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      select: { type: true, amount: true, date: true },
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      balance: 0,
    }));

    for (const tx of transactions) {
      const m = new Date(tx.date).getMonth(); // 0-based
      if (tx.type === 'income') {
        months[m].income += tx.amount;
      } else {
        months[m].expense += tx.amount;
      }
    }

    for (const m of months) {
      m.balance = m.income - m.expense;
    }

    return months;
  }
}
