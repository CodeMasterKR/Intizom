import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Demo foydalanuvchi
  const hash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@intizom.uz' },
    update: {},
    create: {
      name: 'Demo Foydalanuvchi',
      email: 'demo@intizom.uz',
      passwordHash: hash,
    },
  });

  // Demo odatlar
  const habits = await Promise.all([
    prisma.habit.upsert({
      where: { id: 'habit-1' },
      update: {},
      create: {
        id: 'habit-1',
        title: 'Ertalab yugurish',
        description: '30 daqiqa yugurish',
        category: 'fitness',
        frequency: 'daily',
        color: '#0ea5e9',
        icon: '🏃',
        streak: 5,
        longestStreak: 12,
        userId: user.id,
      },
    }),
    prisma.habit.upsert({
      where: { id: 'habit-2' },
      update: {},
      create: {
        id: 'habit-2',
        title: 'Kitob o\'qish',
        description: '20 sahifa',
        category: 'learning',
        frequency: 'daily',
        color: '#8b5cf6',
        icon: '📚',
        streak: 3,
        longestStreak: 8,
        userId: user.id,
      },
    }),
    prisma.habit.upsert({
      where: { id: 'habit-3' },
      update: {},
      create: {
        id: 'habit-3',
        title: '2L suv ichish',
        category: 'health',
        frequency: 'daily',
        color: '#10b981',
        icon: '💧',
        streak: 7,
        longestStreak: 15,
        userId: user.id,
      },
    }),
  ]);

  // Demo vazifalar
  await Promise.all([
    prisma.task.upsert({
      where: { id: 'task-1' },
      update: {},
      create: {
        id: 'task-1',
        title: 'Intizom backend yozish',
        description: 'NestJS + Prisma + PostgreSQL',
        priority: 'urgent',
        status: 'in_progress',
        tags: ['backend', 'nestjs'],
        userId: user.id,
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-2' },
      update: {},
      create: {
        id: 'task-2',
        title: 'Database sxema',
        priority: 'high',
        status: 'done',
        tags: ['database'],
        completedAt: new Date(),
        userId: user.id,
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-3' },
      update: {},
      create: {
        id: 'task-3',
        title: 'API testlash',
        priority: 'medium',
        status: 'todo',
        tags: ['testing'],
        userId: user.id,
      },
    }),
  ]);

  // Demo maqsad
  const goal = await prisma.goal.upsert({
    where: { id: 'goal-1' },
    update: {},
    create: {
      id: 'goal-1',
      title: 'Full Stack Developer bo\'lish',
      description: 'React va NestJS ni mukammal o\'rganish',
      color: '#0ea5e9',
      progress: 65,
      userId: user.id,
    },
  });

  await Promise.all([
    prisma.milestone.upsert({
      where: { id: 'ms-1' },
      update: {},
      create: { id: 'ms-1', title: 'React o\'rganish', completed: true, goalId: goal.id },
    }),
    prisma.milestone.upsert({
      where: { id: 'ms-2' },
      update: {},
      create: { id: 'ms-2', title: 'TypeScript', completed: true, goalId: goal.id },
    }),
    prisma.milestone.upsert({
      where: { id: 'ms-3' },
      update: {},
      create: { id: 'ms-3', title: 'NestJS o\'rganish', completed: false, goalId: goal.id },
    }),
  ]);

  console.log(`✅ Seed completed!`);
  console.log(`👤 Demo login: demo@intizom.uz / password123`);
  console.log(`📊 ${habits.length} habits, 3 tasks, 1 goal created`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
