import { Controller, Get, Patch, Post, Body, UseGuards, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto, SetPasswordDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Profilni olish' })
  getMe(@CurrentUser() user: { id: string }) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Profilni yangilash' })
  update(@CurrentUser() user: { id: string }, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Profil rasmini yuklash' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (_, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (_, file, cb) => {
      if (file.mimetype.match(/^image\/(jpe?g|png|webp)$/)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Faqat JPG, PNG yoki WebP rasm qabul qilinadi'), false);
      }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  }))
  uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');
    return this.usersService.updateAvatar(userId, file.filename);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Parolni o\'zgartirish' })
  changePassword(@CurrentUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  @Post('me/set-password')
  @ApiOperation({ summary: 'Parol o\'rnatish (Google akkaunt uchun)' })
  setPassword(@CurrentUser() user: { id: string }, @Body() dto: SetPasswordDto) {
    return this.usersService.setPassword(user.id, dto);
  }
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private usersService: UsersService) {}

  @Get()
  getNotifications(@CurrentUser('id') userId: string) {
    return this.usersService.getNotifications(userId);
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.usersService.markNotificationRead(userId, id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.usersService.markAllNotificationsRead(userId);
  }
}
