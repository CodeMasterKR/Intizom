import { IsString, IsOptional, IsEnum, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, SubscriptionStatus, NotificationType } from '@prisma/client';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;
}

export class BroadcastNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class SendNotificationDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class AdminUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
