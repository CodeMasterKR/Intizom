import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HabitsModule } from './habits/habits.module';
import { TasksModule } from './tasks/tasks.module';
import { GoalsModule } from './goals/goals.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { FinanceModule } from './finance/finance.module';
import { PrinciplesModule } from './principles/principles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HabitsModule,
    TasksModule,
    GoalsModule,
    AnalyticsModule,
    AdminModule,
    SubscriptionModule,
    FinanceModule,
    PrinciplesModule,
  ],
})
export class AppModule {}
