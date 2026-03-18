import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtLogoutAuthGuard extends AuthGuard('jwt-logout') {
  override handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) {
      throw new UnauthorizedException('Invalid access token');
    }
    return user;
  }
}
