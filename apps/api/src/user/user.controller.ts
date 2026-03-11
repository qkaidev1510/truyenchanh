import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { IsEmail, IsOptional } from 'class-validator';

class UpdateProfileDto {
  @IsEmail()
  @IsOptional()
  email?: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getProfile(@Request() req: { user: { id: string } }) {
    return this.userService.findById(req.user.id);
  }

  @Patch('me')
  updateProfile(@Request() req: { user: { id: string } }, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }
}
