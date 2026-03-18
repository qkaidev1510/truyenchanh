import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import * as OTPAuth from 'otpauth';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { REDIS_KEYS } from '@manga/shared';
import type { LoginDto, RegisterDto, TotpVerifyDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cache: CacheService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = this.issueTokens(user.id, user.email, user.role);

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.session.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async enableTotp(userId: string) {
    const secret = new OTPAuth.Secret();
    const totp = new OTPAuth.TOTP({
      issuer: this.configService.get<string>('TOTP_APP_NAME', 'TruyenChanh'),
      label: userId,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { totpSecret: secret.base32 },
    });

    return { otpauthUrl: totp.toString(), secret: secret.base32 };
  }

  async verifyTotp(userId: string, dto: TotpVerifyDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpSecret) throw new UnauthorizedException('TOTP not set up');

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(user.totpSecret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const delta = totp.validate({ token: dto.token, window: 1 });
    if (delta === null) throw new UnauthorizedException('Invalid TOTP token');

    await this.prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true },
    });

    return { message: 'TOTP enabled successfully' };
  }

  async refresh(sub: string, rawRefreshToken: string) {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    const session = await this.prisma.session.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: sub } });
    if (!user) throw new UnauthorizedException('User not found');

    const { accessToken, refreshToken: newRefreshToken } = this.issueTokens(user.id, user.email, user.role);

    const newTokenHash = createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.session.update({
      where: { tokenHash },
      data: { tokenHash: newTokenHash, expiresAt },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(jti: string, exp: number, refreshToken: string | undefined) {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.cache.set(REDIS_KEYS.blacklist(jti), '1', ttl);
    }

    if (refreshToken) {
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
      await this.prisma.session.deleteMany({ where: { tokenHash } });
    }
  }

  private issueTokens(userId: string, email: string, role: string) {
    const jti = randomUUID();
    const accessToken = this.jwtService.sign({ sub: userId, email, role, jti });
    const refreshToken = this.jwtService.sign({ sub: userId, email, role }, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh_secret'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    return { accessToken, refreshToken };
  }
}
