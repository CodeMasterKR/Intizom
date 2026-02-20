import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsArray, IsInt,
  IsHexColor, MinLength, MaxLength,
} from 'class-validator';

export enum HabitFrequency { daily = 'daily', weekly = 'weekly', monthly = 'monthly' }
export enum HabitCategory {
  health = 'health', fitness = 'fitness', learning = 'learning',
  mindfulness = 'mindfulness', productivity = 'productivity', social = 'social', other = 'other',
}

export class CreateHabitDto {
  @ApiProperty({ example: 'Ertalab yugurish' })
  @IsString() @MinLength(1) @MaxLength(80)
  title: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(300)
  description?: string;

  @ApiProperty({ enum: HabitCategory, default: HabitCategory.other })
  @IsEnum(HabitCategory)
  category: HabitCategory;

  @ApiProperty({ enum: HabitFrequency, default: HabitFrequency.daily })
  @IsEnum(HabitFrequency)
  frequency: HabitFrequency;

  @ApiPropertyOptional({ type: [Number], description: '0=Du ... 6=Ya' })
  @IsOptional() @IsArray() @IsInt({ each: true })
  targetDays?: number[];

  @ApiProperty({ example: '#0ea5e9' })
  @IsString()
  color: string;

  @ApiProperty({ example: '🏃' })
  @IsString() @MinLength(1) @MaxLength(10)
  icon: string;
}

export class UpdateHabitDto extends PartialType(CreateHabitDto) {}

export class CompleteHabitDto {
  @ApiPropertyOptional({ example: 'Juda zo\'r edi!' })
  @IsOptional() @IsString() @MaxLength(200)
  note?: string;
}

export class ToggleDateDto {
  @ApiProperty({ example: '2026-02-17', description: 'YYYY-MM-DD formatida sana' })
  @IsString()
  date: string;
}
