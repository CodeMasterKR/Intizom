import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsArray,
  MinLength, MaxLength, IsDateString,
} from 'class-validator';

export enum TaskPriority { low = 'low', medium = 'medium', high = 'high', urgent = 'urgent' }
export enum TaskStatus { todo = 'todo', in_progress = 'in_progress', done = 'done' }

export class CreateTaskDto {
  @ApiProperty({ example: 'NestJS backend yozish' })
  @IsString() @MinLength(1) @MaxLength(120)
  title: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: TaskPriority, default: TaskPriority.medium })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional() @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsOptional() @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ type: [String], example: ['backend', 'nestjs'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

export class CreateSubtaskDto {
  @ApiProperty({ example: 'Auth moduli' })
  @IsString() @MinLength(1) @MaxLength(100)
  title: string;
}
