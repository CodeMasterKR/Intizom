import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private config: ConfigService) {
    const opts: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') as string,
      passReqToCallback: true,
    };
    super(opts);
  }

  async validate(req: Request, payload: { sub: string; email: string }) {
    const authHeader = req.get('Authorization');
    if (!authHeader) throw new UnauthorizedException();
    const refreshToken = authHeader.replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}
