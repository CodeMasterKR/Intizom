import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get('status')
  getStatus(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getStatus(userId);
  }

  @Post('upgrade')
  upgrade(@CurrentUser('id') userId: string) {
    return this.subscriptionService.upgrade(userId);
  }

  @Post('cancel')
  cancel(@CurrentUser('id') userId: string) {
    return this.subscriptionService.cancel(userId);
  }
}
