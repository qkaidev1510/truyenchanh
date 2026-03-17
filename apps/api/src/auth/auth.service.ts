import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import * as OTPAuth from 'otpauth';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto, RegisterDto, TotpVerifyDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    return this.issueTokens(user.id, user.email, user.role);
  }

  async enableTotp(userId: string) {
    const secret = new OTPAuth.Secret();
    const totp = new OTPAuth.TOTP({
      issuer: process.env['TOTP_APP_NAME'] ?? 'TruyenChanh',
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

  refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string; role: string }>(
        refreshToken,
        { secret: process.env['JWT_REFRESH_SECRET'] ?? 'refresh_secret' },
      );
      return this.issueTokens(payload.sub, payload.email, payload.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private issueTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env['JWT_REFRESH_SECRET'] ?? 'refresh_secret',
      expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
    });
    return { accessToken, refreshToken };
  }
}
