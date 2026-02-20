import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsEnum, IsArray, IsInt,
  Min, Max, MinLength, MaxLength, IsDateString, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum GoalStatus { active = 'active', completed = 'completed', paused = 'paused' }

export class MilestoneDto {
  @ApiProperty()
  @IsString() @MinLength(1) @MaxLength(100)
  title: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  dueDate?: string;
}

export class CreateGoalDto {
  @ApiProperty({ example: 'Full Stack Developer bo\'lish' })
  @IsString() @MinLength(1) @MaxLength(100)
  title: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(400)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  targetDate?: string;

  @ApiProperty({ example: '#0ea5e9' })
  @IsString()
  color: string;

  @ApiPropertyOptional({ type: [MilestoneDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];
}

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional() @IsInt() @Min(0) @Max(100)
  progress?: number;

  @ApiPropertyOptional({ enum: GoalStatus })
  @IsOptional() @IsEnum(GoalStatus)
  status?: GoalStatus;
}
