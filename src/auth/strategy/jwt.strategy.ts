import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'Capstone2BE_2024!@#SECURE_JWT_KEY_987654321',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: payload.user_id },
      select: {
        user_id: true,
        username: true,
        role_id: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      user_id: user.user_id,
      username: user.username,
      role_id: user.role_id
    };
  }
} 