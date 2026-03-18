import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REDIS_KEYS } from '@manga/shared';
import { CacheService } from '../../cache/cache.service';

interface JwtLogoutPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
  exp: number;
}

@Injectable()
export class JwtLogoutStrategy extends PassportStrategy(Strategy, 'jwt-logout') {
  constructor(
    configService: ConfigService,
    private cache: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev_secret'),
    });
  }

  async validate(payload: JwtLogoutPayload) {
    if (!payload.sub || !payload.jti) throw new UnauthorizedException();
    const blacklisted = await this.cache.get(REDIS_KEYS.blacklist(payload.jti));
    if (blacklisted) throw new UnauthorizedException('Token has been revoked');
    return { id: payload.sub, email: payload.email, role: payload.role, jti: payload.jti, exp: payload.exp };
  }
}
