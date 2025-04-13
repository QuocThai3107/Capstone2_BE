import { Body, Controller, Post, UseGuards, Request, Get, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto';
import { GetUser, Public } from './decorator';
import { CreatePTDto } from './dto/create-pt.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('register-pt')
  @UseInterceptors(FilesInterceptor('certificates', 10)) // Cho phép upload tối đa 10 ảnh
  async registerPT(
    @Body() createPTDto: CreatePTDto,
    @UploadedFiles() certificates: Array<Express.Multer.File>
  ) {
    return this.authService.registerPT(createPTDto, certificates);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    // Nếu không có user trong request, trả về thông báo
    if (!req.user) {
      return { message: 'No authentication required' };
    }
    const { user_id, username, role_id } = req.user;
    return { user_id, username, role_id };
  }

  @Get('role')
  async getCurrentUserRole(@Request() req) {
    // Nếu không có user trong request, yêu cầu truyền user_id qua body
    const userId = req.user?.user_id || (req.query.user_id ? parseInt(req.query.user_id) : null);
    if (!userId) {
      return { message: 'Provide user_id as query parameter' };
    }
    return this.authService.getCurrentUserRole(userId);
  }

  @Get('me')
  getMe(@Request() req) {
    // Nếu không có user trong request, yêu cầu truyền user_id qua query
    const userId = req.user?.user_id || (req.query.user_id ? parseInt(req.query.user_id) : null);
    if (!userId) {
      return { message: 'Provide user_id as query parameter' };
    }
    return this.authService.getCurrentUserRole(userId);
  }
} 