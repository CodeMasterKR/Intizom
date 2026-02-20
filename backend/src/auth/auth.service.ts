import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, GoogleLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Register ────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, trialEndDate },
      select: { id: true, name: true, email: true, avatar: true, role: true, subscriptionStatus: true, trialEndDate: true, createdAt: true },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: { ...user, hasPassword: true }, ...tokens };
  }

  // ─── Login ───────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Email yoki parol noto\'g\'ri');

    if (!user.passwordHash) throw new UnauthorizedException('Bu akkaunt Google orqali ro\'yxatdan o\'tgan. Google tugmasi orqali kiring.');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Email yoki parol noto\'g\'ri');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _p, refreshToken: _r, ...safeUser } = user;
    return { user: { ...safeUser, hasPassword: true }, ...tokens };
  }

  // ─── Logout ──────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ─── Refresh tokens ──────────────────────────────────────────────────────

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken) throw new ForbiddenException('Kirish rad etildi');

    const match = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!match) throw new ForbiddenException('Kirish rad etildi');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // ─── Get me ──────────────────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, role: true, subscriptionStatus: true, trialEndDate: true, subscriptionEndDate: true, createdAt: true, passwordHash: true },
    });
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return { ...rest, hasPassword: !!passwordHash };
  }

  // ─── Google OAuth ────────────────────────────────────────────────────────

  async googleLogin(dto: GoogleLoginDto) {
    // Google dan foydalanuvchi ma'lumotlarini olish
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${dto.accessToken}` },
    });

    if (!res.ok) throw new UnauthorizedException('Google token yaroqsiz');

    const googleUser = await res.json() as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
      email_verified: boolean;
    };

    if (!googleUser.email_verified) throw new UnauthorizedException('Google email tasdiqlanmagan');

    // Foydalanuvchini googleId yoki email orqali topish
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: googleUser.sub }, { email: googleUser.email }] },
    });

    if (!user) {
      // Yangi foydalanuvchi yaratish
      const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      user = await this.prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.sub,
          avatar: googleUser.picture ?? null,
          trialEndDate,
        },
      });
    } else if (!user.googleId) {
      // Mavjud akkauntga Google ni ulash
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          avatar: user.avatar ?? googleUser.picture ?? null,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash, refreshToken: _r, googleId: _g, ...safeUser } = user;
    return { user: { ...safeUser, hasPassword: !!passwordHash }, ...tokens };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email },
        { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN') ?? '15m' },
      ),
      this.jwt.signAsync(
        { sub: userId, email },
        { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '7d' },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, token: string) {
    const hashed = await bcrypt.hash(token, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hashed } });
  }
}
