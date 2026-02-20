import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto,
  CreateSubtaskDto, TaskStatus,
} from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha vazifalarni olish' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  findAll(
    @CurrentUser() user: { id: string },
    @Query('status') status?: TaskStatus,
  ) {
    return this.tasksService.findAll(user.id, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta vazifani olish' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.tasksService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi vazifa qo\'shish' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Vazifani yangilash' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Vazifani o\'chirish' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.tasksService.remove(id, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Holat o\'zgartirish' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateStatus(id, user.id, dto);
  }

  @Post(':id/subtasks')
  @ApiOperation({ summary: 'Subtask qo\'shish' })
  addSubtask(
    @Param('id') taskId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSubtaskDto,
  ) {
    return this.tasksService.addSubtask(taskId, user.id, dto);
  }

  @Patch(':id/subtasks/:subtaskId/toggle')
  @ApiOperation({ summary: 'Subtaskni toggle qilish' })
  toggleSubtask(
    @Param('id') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.tasksService.toggleSubtask(taskId, subtaskId, user.id);
  }
}
