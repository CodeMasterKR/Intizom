import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Kamronbek Toshmatov' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @ApiProperty({ example: 'kamron@intizom.uz' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'kamron@intizom.uz' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google OAuth access token' })
  @IsString()
  accessToken: string;
}
