import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto, UpdateHabitDto, CompleteHabitDto, ToggleDateDto } from './dto/habit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private habitsService: HabitsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha odatlarni olish' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.habitsService.findAll(user.id);
  }

  @Get('month')
  @ApiOperation({ summary: 'Oy bo\'yicha bajarilishlar' })
  getMonth(
    @CurrentUser() user: { id: string },
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    return this.habitsService.getMonthCompletions(
      user.id,
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta odatni olish' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi odat qo\'shish' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateHabitDto) {
    return this.habitsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Odatni yangilash' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habitsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Odatni o\'chirish' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.remove(id, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Odatni bajarildi deb belgilash' })
  complete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CompleteHabitDto,
  ) {
    return this.habitsService.complete(id, user.id, dto);
  }

  @Delete(':id/complete')
  @ApiOperation({ summary: 'Bajarilishni bekor qilish' })
  uncomplete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.uncomplete(id, user.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Odatni to\'xtatish' })
  pause(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.pauseHabit(id, user.id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Odatni davom ettirish' })
  resume(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.habitsService.resumeHabit(id, user.id);
  }

  @Post(':id/toggle-date')
  @ApiOperation({ summary: 'Muayyan sanani belgilash/bekor qilish' })
  toggleDate(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ToggleDateDto,
  ) {
    return this.habitsService.toggleDate(id, user.id, dto);
  }
}
