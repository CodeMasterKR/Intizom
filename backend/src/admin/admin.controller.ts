import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { UpdateUserAdminDto, BroadcastNotificationDto, SendNotificationDto, AdminUsersQueryDto } from './dto/admin.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('notifications/broadcast')
  broadcastNotification(@CurrentUser('id') adminId: string, @Body() dto: BroadcastNotificationDto) {
    return this.adminService.broadcastNotification(adminId, dto);
  }

  @Post('notifications/send')
  sendNotification(@CurrentUser('id') adminId: string, @Body() dto: SendNotificationDto) {
    return this.adminService.sendNotification(adminId, dto);
  }
}
