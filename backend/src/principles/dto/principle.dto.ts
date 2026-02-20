import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePrincipleDto {
  @ApiProperty({ example: 'Har kuni o\'qish' })
  @IsString() @MinLength(1) @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Kamida 30 daqiqa' })
  @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'BookOpen' })
  @IsOptional() @IsString() @MaxLength(50)
  icon?: string;
}

export class UpdatePrincipleDto extends PartialType(CreatePrincipleDto) {}
