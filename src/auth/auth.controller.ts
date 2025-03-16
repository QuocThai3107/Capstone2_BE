import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const { userId, username, roleId } = req.user;
    return { userId, username, roleId };
  }

  @UseGuards(JwtAuthGuard)
  @Get('role')
  async getCurrentUserRole(@Request() req) {
    return this.authService.getCurrentUserRole(req.user.userId);
  }
} 