import { Body, Controller, Post, UseGuards, Request, Get, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto';
import { GetUser } from './decorator';
import { CreatePTDto } from './dto/create-pt.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const { user_id, username, role_id } = req.user;
    return { user_id, username, role_id };
  }

  @UseGuards(JwtAuthGuard)
  @Get('role')
  async getCurrentUserRole(@Request() req) {
    return this.authService.getCurrentUserRole(req.user.user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@GetUser('user_id') userId: number) {
    return this.authService.getCurrentUserRole(userId);
  }

  @Post('register-pt')
  @UseInterceptors(FilesInterceptor('certificates', 10)) // Cho phép upload tối đa 10 ảnh
  async registerPT(
    @Body() createPTDto: CreatePTDto,
    @UploadedFiles() certificates: Array<Express.Multer.File>
  ) {
    return this.authService.registerPT(createPTDto, certificates);
  }
} 