import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8, 0, 0, 0);
  return d;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ─── User ────────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@intizom.uz' },
    update: {},
    create: {
      name: 'Demo Foydalanuvchi',
      email: 'demo@intizom.uz',
      passwordHash: hash,
      subscriptionStatus: 'ACTIVE',
    },
  });

  // ─── Habits (15 ta) ──────────────────────────────────────────────────────────
  const habitData = [
    { id: 'h-1',  title: 'Ertalab yugurish',       category: 'fitness',       icon: '🏃', color: '#0ea5e9', streak: 14, longestStreak: 21, desc: '5 km yugurish' },
    { id: 'h-2',  title: 'Kitob o\'qish',           category: 'learning',      icon: '📚', color: '#8b5cf6', streak: 8,  longestStreak: 15, desc: '30 sahifa' },
    { id: 'h-3',  title: '2L suv ichish',           category: 'health',        icon: '💧', color: '#10b981', streak: 20, longestStreak: 30, desc: 'Kunlik suv normasini bajarish' },
    { id: 'h-4',  title: 'Meditatsiya',             category: 'mindfulness',   icon: '🧘', color: '#f59e0b', streak: 5,  longestStreak: 10, desc: '10 daqiqa' },
    { id: 'h-5',  title: 'Ingliz tili',             category: 'learning',      icon: '🌍', color: '#ec4899', streak: 30, longestStreak: 45, desc: 'Duolingo yoki vocab' },
    { id: 'h-6',  title: 'Kod yozish',              category: 'productivity',  icon: '💻', color: '#3b82f6', streak: 12, longestStreak: 25, desc: '1 soat loyiha' },
    { id: 'h-7',  title: 'Erta turish (6:00)',      category: 'productivity',  icon: '⏰', color: '#f97316', streak: 7,  longestStreak: 14, desc: 'Soat 6 da uyg\'onish' },
    { id: 'h-8',  title: 'Push-up 50 ta',           category: 'fitness',       icon: '💪', color: '#ef4444', streak: 9,  longestStreak: 18, desc: '3 set x 17 ta' },
    { id: 'h-9',  title: 'Kundalik yozish',         category: 'mindfulness',   icon: '📓', color: '#6366f1', streak: 3,  longestStreak: 8,  desc: 'Kun xulosasini yozish' },
    { id: 'h-10', title: 'Oila bilan vaqt',         category: 'social',        icon: '👨‍👩‍👧', color: '#14b8a6', streak: 25, longestStreak: 40, desc: 'Kechqurun birga o\'tirish' },
    { id: 'h-11', title: 'Vitamin ichish',          category: 'health',        icon: '💊', color: '#84cc16', streak: 18, longestStreak: 30, desc: 'Ertalab vitaminlar' },
    { id: 'h-12', title: 'Plank 1 daqiqa',         category: 'fitness',       icon: '🏋️', color: '#a855f7', streak: 6,  longestStreak: 12, desc: 'Core kuchaytirish' },
    { id: 'h-13', title: 'YouTube o\'rniga kitob',  category: 'learning',      icon: '🎯', color: '#06b6d4', streak: 4,  longestStreak: 7,  desc: 'Telefon vaqtini kamaytirish' },
    { id: 'h-14', title: 'Namoz (5 vaqt)',          category: 'mindfulness',   icon: '🤲', color: '#78716c', streak: 22, longestStreak: 60, desc: '5 vaqt namozni o\'z vaqtida' },
    { id: 'h-15', title: 'Uyni yig\'ishtirish',    category: 'productivity',  icon: '🏠', color: '#f43f5e', streak: 10, longestStreak: 20, desc: '15 daqiqa tartib' },
  ] as const;

  const habits = await Promise.all(
    habitData.map((h) =>
      prisma.habit.upsert({
        where: { id: h.id },
        update: { streak: h.streak, longestStreak: h.longestStreak },
        create: {
          id: h.id,
          title: h.title,
          description: h.desc,
          category: h.category,
          frequency: 'daily',
          color: h.color,
          icon: h.icon,
          streak: h.streak,
          longestStreak: h.longestStreak,
          userId: user.id,
        },
      }),
    ),
  );

  // Har bir habit uchun so'ngi 30 kun completion
  for (const habit of habits) {
    for (let day = 0; day < 30; day++) {
      // Ba'zi kunlar o'tkazib yuboriladi (75% bajarilish)
      if (Math.random() < 0.25) continue;
      const date = daysAgo(day);
      const existing = await prisma.habitCompletion.findFirst({
        where: {
          habitId: habit.id,
          completedAt: { gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()), lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1) },
        },
      });
      if (!existing) {
        await prisma.habitCompletion.create({ data: { habitId: habit.id, completedAt: date } });
      }
    }
  }

  // ─── Tasks (30 ta) ───────────────────────────────────────────────────────────
  const tasksData = [
    // Todo
    { id: 't-1',  title: 'Portfolio sayt tayyorlash',        priority: 'high',   status: 'todo',        tags: ['frontend', 'portfolio'], desc: 'React + Tailwind bilan shaxsiy portfolio' },
    { id: 't-2',  title: 'AWS sertifikat olish',             priority: 'medium', status: 'todo',        tags: ['cloud', 'career'],       desc: 'AWS Solutions Architect' },
    { id: 't-3',  title: 'TypeScript kursini tugatish',      priority: 'medium', status: 'todo',        tags: ['learning', 'ts'],        desc: 'Udemy kursi' },
    { id: 't-4',  title: 'GitHub profile yangilash',         priority: 'low',    status: 'todo',        tags: ['career'],                desc: 'README va proyektlar' },
    { id: 't-5',  title: 'Doktor navbati olish',             priority: 'urgent', status: 'todo',        tags: ['health'],                desc: 'Yillik tekshiruv' },
    { id: 't-6',  title: 'Kitob: Atomic Habits o\'qish',     priority: 'low',    status: 'todo',        tags: ['learning', 'books'],     desc: 'James Clear' },
    { id: 't-7',  title: 'Ingliz tili imtihoni',             priority: 'high',   status: 'todo',        tags: ['learning', 'ielts'],     desc: 'IELTS 7.0 target' },
    { id: 't-8',  title: 'Freelance loyiha topish',          priority: 'high',   status: 'todo',        tags: ['career', 'freelance'],   desc: 'Upwork yoki direct client' },
    { id: 't-9',  title: 'Linux buyruqlarini o\'rganish',    priority: 'low',    status: 'todo',        tags: ['devops', 'learning'],    desc: 'Bash scripting' },
    { id: 't-10', title: 'Sport zali obunasi',               priority: 'medium', status: 'todo',        tags: ['health', 'fitness'],     desc: 'Oylik abonement' },
    // In progress
    { id: 't-11', title: 'Intizom backend',                  priority: 'urgent', status: 'in_progress', tags: ['backend', 'nestjs'],     desc: 'NestJS + Prisma + PostgreSQL' },
    { id: 't-12', title: 'React Native kurs',                priority: 'medium', status: 'in_progress', tags: ['mobile', 'react'],       desc: '60% tugallandi' },
    { id: 't-13', title: 'Docker o\'rganish',                priority: 'high',   status: 'in_progress', tags: ['devops'],                desc: 'Containerization' },
    { id: 't-14', title: 'CV yangilash',                     priority: 'high',   status: 'in_progress', tags: ['career'],                desc: 'ATS formatiga moslashtirish' },
    { id: 't-15', title: 'Next.js loyihasi',                 priority: 'medium', status: 'in_progress', tags: ['frontend', 'nextjs'],    desc: 'SSR bilan blog platforma' },
    // Done
    { id: 't-16', title: 'Database sxema',                   priority: 'high',   status: 'done',        tags: ['database'],              desc: 'Prisma schema' },
    { id: 't-17', title: 'JWT autentifikatsiya',             priority: 'urgent', status: 'done',        tags: ['backend', 'security'],   desc: 'Access + Refresh token' },
    { id: 't-18', title: 'Tailwind o\'rnatish',              priority: 'low',    status: 'done',        tags: ['frontend', 'css'],       desc: 'v4 konfiguratsiya' },
    { id: 't-19', title: 'Git workflow sozlash',             priority: 'medium', status: 'done',        tags: ['git'],                   desc: 'Branch strategy' },
    { id: 't-20', title: 'API dokumentatsiya',               priority: 'medium', status: 'done',        tags: ['backend', 'swagger'],    desc: 'Swagger UI' },
    { id: 't-21', title: 'Login sahifasi',                   priority: 'high',   status: 'done',        tags: ['frontend', 'auth'],      desc: 'Email + Google OAuth' },
    { id: 't-22', title: 'Dashboard layout',                 priority: 'high',   status: 'done',        tags: ['frontend', 'ui'],        desc: 'Sidebar + header' },
    { id: 't-23', title: 'Habits CRUD',                      priority: 'urgent', status: 'done',        tags: ['fullstack'],             desc: 'Create, read, update, delete' },
    { id: 't-24', title: 'Tasks module',                     priority: 'high',   status: 'done',        tags: ['fullstack'],             desc: 'Kanban bilan' },
    { id: 't-25', title: 'Goals module',                     priority: 'high',   status: 'done',        tags: ['fullstack'],             desc: 'Progress tracking' },
    { id: 't-26', title: 'Analytics endpoint',               priority: 'medium', status: 'done',        tags: ['backend'],               desc: 'Dashboard statistikasi' },
    { id: 't-27', title: 'Dark mode',                        priority: 'low',    status: 'done',        tags: ['frontend', 'ui'],        desc: 'System + manual toggle' },
    { id: 't-28', title: 'PM2 sozlash',                      priority: 'medium', status: 'done',        tags: ['devops'],                desc: 'Cluster mode' },
    { id: 't-29', title: 'Nginx konfiguratsiya',             priority: 'high',   status: 'done',        tags: ['devops'],                desc: 'Reverse proxy + HTTPS' },
    { id: 't-30', title: 'SSL sertifikat',                   priority: 'high',   status: 'done',        tags: ['devops', 'security'],   desc: 'Let\'s Encrypt certbot' },
  ] as const;

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        title: t.title,
        description: t.desc,
        priority: t.priority,
        status: t.status,
        tags: [...t.tags],
        completedAt: t.status === 'done' ? daysAgo(randomBetween(1, 20)) : null,
        dueDate: t.status !== 'done' ? daysAgo(-randomBetween(1, 14)) : null,
        userId: user.id,
      },
    });
  }

  // Subtasklar (ba'zi tasklarga)
  const subtasks = [
    { taskId: 't-11', items: ['Auth module', 'Habits module', 'Tasks module', 'Analytics module', 'Deploy'] },
    { taskId: 't-1',  items: ['Dizayn tayyorlash', 'HTML/CSS yozish', 'Animatsiyalar', 'Deploy'] },
    { taskId: 't-7',  items: ['Listening mashqlari', 'Reading', 'Writing', 'Speaking practice'] },
    { taskId: 't-15', items: ['Routing sozlash', 'MDX o\'rnatish', 'SEO optimizatsiya'] },
  ];
  for (const s of subtasks) {
    for (let i = 0; i < s.items.length; i++) {
      const existing = await prisma.subTask.findFirst({ where: { taskId: s.taskId, title: s.items[i] } });
      if (!existing) {
        await prisma.subTask.create({ data: { title: s.items[i], completed: Math.random() > 0.5, taskId: s.taskId } });
      }
    }
  }

  // ─── Goals (8 ta) ────────────────────────────────────────────────────────────
  const goalsData = [
    { id: 'g-1', title: 'Full Stack Developer bo\'lish',     progress: 72, color: '#0ea5e9', status: 'active',    desc: 'React va NestJS ni mukammal o\'rganish',
      milestones: [
        { id: 'gm-1', title: 'React o\'rganish',      completed: true },
        { id: 'gm-2', title: 'TypeScript',             completed: true },
        { id: 'gm-3', title: 'NestJS o\'rganish',      completed: true },
        { id: 'gm-4', title: 'PostgreSQL',             completed: false },
        { id: 'gm-5', title: 'Docker + DevOps',        completed: false },
      ]},
    { id: 'g-2', title: 'IELTS 7.0 olish',                  progress: 45, color: '#8b5cf6', status: 'active',    desc: 'Xorijda o\'qish uchun',
      milestones: [
        { id: 'gm-6',  title: 'Vocabulary 5000 so\'z', completed: true },
        { id: 'gm-7',  title: 'Grammar mukammal',      completed: false },
        { id: 'gm-8',  title: 'Mock test 6.5',         completed: false },
        { id: 'gm-9',  title: 'Rasmiy imtihon',        completed: false },
      ]},
    { id: 'g-3', title: '10 000$ jamg\'arish',               progress: 30, color: '#10b981', status: 'active',    desc: '2026 yil oxirigacha',
      milestones: [
        { id: 'gm-10', title: '1 000$ jamg\'arish',    completed: true },
        { id: 'gm-11', title: '3 000$',                completed: false },
        { id: 'gm-12', title: '7 000$',                completed: false },
        { id: 'gm-13', title: '10 000$',               completed: false },
      ]},
    { id: 'g-4', title: '5 kg vazn yo\'qotish',              progress: 60, color: '#ef4444', status: 'active',    desc: '3 oyda',
      milestones: [
        { id: 'gm-14', title: '1 kg',                  completed: true },
        { id: 'gm-15', title: '3 kg',                  completed: true },
        { id: 'gm-16', title: '5 kg',                  completed: false },
      ]},
    { id: 'g-5', title: 'Freelance biznes ochish',           progress: 20, color: '#f59e0b', status: 'active',    desc: 'Upwork top rated olish',
      milestones: [
        { id: 'gm-17', title: 'Profil to\'ldirish',    completed: true },
        { id: 'gm-18', title: 'Birinchi contract',     completed: false },
        { id: 'gm-19', title: 'Job Success 90%+',      completed: false },
        { id: 'gm-20', title: 'Top Rated badge',       completed: false },
      ]},
    { id: 'g-6', title: 'Shaxsiy loyiha launch qilish',      progress: 85, color: '#06b6d4', status: 'active',    desc: 'Intizom app',
      milestones: [
        { id: 'gm-21', title: 'MVP tayyorlash',        completed: true },
        { id: 'gm-22', title: 'Beta test',             completed: true },
        { id: 'gm-23', title: 'Deploy',                completed: true },
        { id: 'gm-24', title: 'Birinchi 10 foydalanuvchi', completed: false },
      ]},
    { id: 'g-7', title: 'Kitob o\'qish — 24 ta',             progress: 100, color: '#84cc16', status: 'completed', desc: '2025 yilgi maqsad',
      milestones: [
        { id: 'gm-25', title: '6 ta kitob (Q1)',       completed: true },
        { id: 'gm-26', title: '12 ta kitob (Q2)',      completed: true },
        { id: 'gm-27', title: '18 ta kitob (Q3)',      completed: true },
        { id: 'gm-28', title: '24 ta kitob (Q4)',      completed: true },
      ]},
    { id: 'g-8', title: 'Yangi ko\'nikma: UI/UX dizayn',     progress: 10, color: '#a855f7', status: 'paused',    desc: 'Figma o\'rganish',
      milestones: [
        { id: 'gm-29', title: 'Figma asoslari',        completed: true },
        { id: 'gm-30', title: 'Dizayn tizimi',         completed: false },
        { id: 'gm-31', title: 'Case study',            completed: false },
      ]},
  ] as const;

  for (const g of goalsData) {
    await prisma.goal.upsert({
      where: { id: g.id },
      update: {},
      create: {
        id: g.id, title: g.title, description: g.desc,
        progress: g.progress, color: g.color, status: g.status,
        targetDate: daysAgo(-randomBetween(30, 180)),
        userId: user.id,
      },
    });
    for (const m of g.milestones) {
      await prisma.milestone.upsert({
        where: { id: m.id },
        update: {},
        create: { id: m.id, title: m.title, completed: m.completed, goalId: g.id },
      });
    }
  }

  // ─── Transactions (40 ta) ────────────────────────────────────────────────────
  const incomes = [
    { title: 'Oylik maosh',          amount: 3500000, category: 'salary' },
    { title: 'Freelance loyiha',     amount: 800000,  category: 'freelance' },
    { title: 'Konsultatsiya',        amount: 300000,  category: 'freelance' },
    { title: 'Maosh (bonus)',         amount: 500000,  category: 'salary' },
    { title: 'Investitsiya daromad', amount: 150000,  category: 'investment' },
  ] as const;

  const expenses = [
    { title: 'Oziq-ovqat',          amount: 450000,  category: 'food' },
    { title: 'Taksi / metro',        amount: 120000,  category: 'transport' },
    { title: 'Uy ijarasi',           amount: 1200000, category: 'housing' },
    { title: 'Kommunal to\'lovlar',  amount: 180000,  category: 'utilities' },
    { title: 'Kino / kaffe',         amount: 90000,   category: 'entertainment' },
    { title: 'Kiyim',                amount: 350000,  category: 'shopping' },
    { title: 'Dorixona',             amount: 60000,   category: 'health' },
    { title: 'Udemy kurs',           amount: 100000,  category: 'education' },
    { title: 'Internet + telefon',   amount: 85000,   category: 'utilities' },
    { title: 'Restoran',             amount: 130000,  category: 'food' },
  ] as const;

  for (let month = 0; month < 3; month++) {
    // Har oy daromad
    for (const inc of incomes.slice(0, month === 0 ? 5 : 3)) {
      await prisma.transaction.create({
        data: {
          title: inc.title,
          amount: inc.amount + randomBetween(-50000, 50000),
          type: 'income',
          category: inc.category,
          date: daysAgo(month * 30 + randomBetween(1, 28)),
          userId: user.id,
        },
      });
    }
    // Har oy xarajat
    for (const exp of expenses) {
      await prisma.transaction.create({
        data: {
          title: exp.title,
          amount: exp.amount + randomBetween(-20000, 20000),
          type: 'expense',
          category: exp.category,
          date: daysAgo(month * 30 + randomBetween(1, 28)),
          userId: user.id,
        },
      });
    }
  }

  // ─── Principles (7 ta) ───────────────────────────────────────────────────────
  const principlesData = [
    { id: 'p-1', title: 'Halollik',           icon: 'Shield',  desc: 'Hamma narsada rostgo\'y bo\'l', order: 1 },
    { id: 'p-2', title: 'Intizom',            icon: 'Target',  desc: 'Har kuni reja tuz va bajar', order: 2 },
    { id: 'p-3', title: 'Sabr',               icon: 'Clock',   desc: 'Natijani kutishni bil', order: 3 },
    { id: 'p-4', title: 'Shukronalik',        icon: 'Heart',   desc: 'Har kuni 3 ta minnatdorlik', order: 4 },
    { id: 'p-5', title: 'Rivojlanish',        icon: 'TrendingUp', desc: 'Har kuni yangi narsa o\'rgan', order: 5 },
    { id: 'p-6', title: 'Sog\'lom turmush',  icon: 'Activity', desc: 'Tana va aqlni parvarishla', order: 6 },
    { id: 'p-7', title: 'Oilaviy qadriyat',  icon: 'Users',   desc: 'Oilaga vaqt ajrat', order: 7 },
  ] as const;

  for (const p of principlesData) {
    await prisma.principle.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, title: p.title, description: p.desc, icon: p.icon, order: p.order, userId: user.id },
    });
    // So'ngi 30 kun check
    for (let day = 0; day < 30; day++) {
      if (Math.random() < 0.2) continue;
      const date = daysAgo(day);
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      try {
        await prisma.principleCheck.create({ data: { principleId: p.id, date: checkDate } });
      } catch { /* duplicate — skip */ }
    }
  }

  // ─── Notifications (10 ta) ───────────────────────────────────────────────────
  const notifData = [
    { title: 'Xush kelibsiz!',                message: 'Intizom ilovasiga xush kelibsiz. Maqsadlaringizga erishish uchun tayyor bo\'ling!', type: 'success', read: true },
    { title: 'Streak yangi rekord!',          message: 'Ingliz tili odatida 30 kunlik streak! Ajoyib!', type: 'success', read: true },
    { title: 'Bugungi vazifalar',             message: '5 ta vazifangiz kutmoqda. Keling, birini tugatamiz!', type: 'info', read: false },
    { title: 'Maqsad 85% ga yetdi',          message: '"Intizom launch" maqsadi deyarli tugatildi!', type: 'success', read: false },
    { title: 'Suv ichishni unutmang',         message: 'Bugun 2L suv ichganmisiz? Sog\'liq uchun muhim.', type: 'warning', read: false },
    { title: 'Haftalik hisobot',              message: 'Bu hafta 87% samaradorlik! O\'tgan haftadan 12% yuqori.', type: 'info', read: true },
    { title: 'Yangi oy — yangi maqsad',      message: 'Yangi oy boshlandi. Maqsadlaringizni ko\'rib chiqing.', type: 'info', read: true },
    { title: 'Streak xavf ostida!',           message: 'Meditatsiya odatini bugun bajarmadingiz. Streak uzilishi mumkin!', type: 'warning', read: false },
    { title: 'Moliya hisoboti',               message: 'Oylik xarajatlaringiz daromadingizning 65%ini tashkil qildi.', type: 'info', read: false },
    { title: 'Princip tekshiruvi',            message: 'Bugun principlaringizni belgiladingizmi?', type: 'info', read: false },
  ] as const;

  for (let i = 0; i < notifData.length; i++) {
    const n = notifData[i];
    await prisma.notification.create({
      data: {
        title: n.title, message: n.message, type: n.type, read: n.read,
        createdAt: daysAgo(i * 2),
        userId: user.id,
      },
    });
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.habit.count({ where: { userId: user.id } }),
    prisma.habitCompletion.count(),
    prisma.task.count({ where: { userId: user.id } }),
    prisma.subTask.count(),
    prisma.goal.count({ where: { userId: user.id } }),
    prisma.milestone.count(),
    prisma.transaction.count({ where: { userId: user.id } }),
    prisma.principle.count({ where: { userId: user.id } }),
    prisma.principleCheck.count(),
    prisma.notification.count({ where: { userId: user.id } }),
  ]);

  console.log('✅ Seed completed!');
  console.log('👤 Demo login: demo@intizom.uz / password123');
  console.log(`📊 Habits: ${counts[0]} (${counts[1]} completions)`);
  console.log(`✅ Tasks: ${counts[2]} (${counts[3]} subtasks)`);
  console.log(`🎯 Goals: ${counts[4]} (${counts[5]} milestones)`);
  console.log(`💰 Transactions: ${counts[6]}`);
  console.log(`⭐ Principles: ${counts[7]} (${counts[8]} checks)`);
  console.log(`🔔 Notifications: ${counts[9]}`);
  console.log(`📦 Jami: ${counts.reduce((a, b) => a + b, 0)}+ yozuv`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
