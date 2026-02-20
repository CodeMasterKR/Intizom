import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, GoogleLoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Ro\'yxatdan o\'tish' })
  @ApiResponse({ status: 201, description: 'Muvaffaqiyatli ro\'yxatdan o\'tildi' })
  @ApiResponse({ status: 409, description: 'Email allaqachon ro\'yxatdan o\'tgan' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirildi' })
  @ApiResponse({ status: 401, description: 'Email yoki parol noto\'g\'ri' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth orqali kirish' })
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chiqish' })
  logout(@CurrentUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tokenlarni yangilash' })
  refresh(@Body() dto: RefreshDto) {
    // RefreshDto dan refreshToken ni olish
    return this.authService.refreshTokens('', dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy foydalanuvchi' })
  me(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }
}
