import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

const JWT_SECRET = 'Capstone2BE_2024!@#SECURE_JWT_KEY_987654321';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }
    try {
      return {
        user_id: payload.user_id,
        username: payload.username,
        role_id: payload.role_id,
      };
    } catch (error) {
      console.log('JWT Validation Error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
} 