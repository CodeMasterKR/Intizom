import { Module } from '@nestjs/common';
import { UsersController, NotificationsController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, NotificationsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
