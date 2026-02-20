import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Abdullayev Abdulla' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class SetPasswordDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}
