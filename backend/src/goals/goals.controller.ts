import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha maqsadlarni olish' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.goalsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta maqsadni olish' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.goalsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi maqsad qo\'shish' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Maqsadni yangilash' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Maqsadni o\'chirish' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.goalsService.remove(id, user.id);
  }

  @Patch(':id/milestones/:milestoneId/toggle')
  @ApiOperation({ summary: 'Bosqichni toggle qilish' })
  toggleMilestone(
    @Param('id') goalId: string,
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.goalsService.toggleMilestone(goalId, milestoneId, user.id);
  }
}
