import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('JwtAuthGuard - Error:', err);
    console.log('JwtAuthGuard - User:', user);
    console.log('JwtAuthGuard - Info:', info);

    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
} 