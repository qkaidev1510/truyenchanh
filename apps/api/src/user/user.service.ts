import { Injectable, NotFoundException } from '@nestjs/common';
import { getPrismaClient } from '../config/database.config';

@Injectable()
export class UserService {
  private prisma = getPrismaClient();

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, totpEnabled: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { email?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }
}
