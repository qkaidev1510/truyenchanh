import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto, TotpVerifyDto, RefreshTokenDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
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
