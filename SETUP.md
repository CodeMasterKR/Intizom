# Intizom - Ishga tushirish qo'llanmasi

## Talablar
- Node.js 18+
- PostgreSQL 14+
- npm

---

## 1. PostgreSQL sozlash

### Windows (pgAdmin orqali)
1. pgAdmin'ni oching
2. Yangi database yarating: `intizom`
3. `.env` faylida `DATABASE_URL` ni to'g'rilang:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/intizom?schema=public"
```

---

## 2. Backend ishga tushirish

```bash
cd backend

# .env faylini to'ldiring
cp .env.example .env
# DATABASE_URL ni o'zgartiring

# Prisma migrate
npm run db:push

# Demo ma'lumotlar  
npm run db:seed

# Dev server
npm run start:dev
```

Backend: http://localhost:4000/api
Swagger: http://localhost:4000/api/docs

---

## 3. Frontend ishga tushirish

```bash
cd frontend

# .env faylini tekshiring
# VITE_USE_MOCK=false  ← backend tayyor bo'lgach

npm run dev
```

Frontend: http://localhost:3000

---

## 4. Demo kirish

Seed bajargandan keyin:
- Email: `demo@intizom.uz`
- Parol: `password123`

---

## Loyiha tuzilmasi

```
intizom/
├── frontend/          # React + TypeScript + Tailwind + Vite
│   └── src/
│       ├── api/       # Axios client + API modullari
│       ├── components/# UI + Layout komponentlari
│       ├── hooks/     # TanStack Query hooks
│       ├── pages/     # Sahifalar
│       ├── store/     # Zustand store
│       └── types/     # TypeScript tiplari
│
└── backend/           # NestJS + Prisma + PostgreSQL
    ├── src/
    │   ├── auth/      # JWT autentifikatsiya
    │   ├── users/     # Foydalanuvchilar
    │   ├── habits/    # Odatlar
    │   ├── tasks/     # Vazifalar
    │   ├── goals/     # Maqsadlar
    │   ├── analytics/ # Statistika
    │   └── prisma/    # DB ulanish
    └── prisma/
        └── schema.prisma
```

## API Endpoints

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | /api/auth/register | Ro'yxatdan o'tish |
| POST | /api/auth/login | Kirish |
| GET | /api/auth/me | Joriy user |
| GET | /api/habits | Barcha odatlar |
| POST | /api/habits | Odat qo'shish |
| POST | /api/habits/:id/complete | Bajarildi |
| GET | /api/tasks | Barcha vazifalar |
| PATCH | /api/tasks/:id/status | Holat o'zgartirish |
| GET | /api/goals | Barcha maqsadlar |
| GET | /api/analytics/dashboard | Dashboard stats |
