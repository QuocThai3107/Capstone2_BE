import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        roleId: true,
      }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      roleId: user.roleId,
    };

    console.log('Creating token with payload:', payload);
    const token = this.jwtService.sign(payload);
    console.log('Created token:', token);

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        roleId: user.roleId
      },
    };
  }

  async getCurrentUserRole(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roleId: true
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      roleId: user.roleId
    };
  }
} 