import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard statistikasi' })
  getDashboard(@CurrentUser() user: { id: string }) {
    return this.analyticsService.getDashboardStats(user.id);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Haftalik ma\'lumotlar' })
  getWeekly(@CurrentUser() user: { id: string }) {
    return this.analyticsService.getWeeklyData(user.id);
  }

  @Get('habits')
  @ApiOperation({ summary: 'Odat statistikasi' })
  getHabits(@CurrentUser() user: { id: string }) {
    return this.analyticsService.getHabitStats(user.id);
  }
}
