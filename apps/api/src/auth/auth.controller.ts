import { Controller, Post, Body, UseGuards, Request, Get, Res, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request as ExpressRequest, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, TotpVerifyDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { JwtLogoutAuthGuard } from './guards/jwt-logout-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    return { accessToken, user };
  }

  @UseGuards(JwtLogoutAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  async logout(
    @Request() req: { user: { jti: string; exp: number } },
    @Req() httpReq: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = httpReq.cookies?.refreshToken as string | undefined;
    await this.authService.logout(req.user.jti, req.user.exp, refreshToken);
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
    return { message: 'Logged out' };
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @Request() req: { user: { sub: string } },
    @Req() httpReq: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = httpReq.cookies?.refreshToken as string;
    const { accessToken, refreshToken } = await this.authService.refresh(req.user.sub, rawRefreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('totp/setup')
  setupTotp(@Request() req: { user: { id: string } }) {
    return this.authService.enableTotp(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('totp/verify')
  verifyTotp(@Request() req: { user: { id: string } }, @Body() dto: TotpVerifyDto) {
    return this.authService.verifyTotp(req.user.id, dto);
  }
}
