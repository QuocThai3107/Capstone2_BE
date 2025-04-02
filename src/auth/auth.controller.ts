import { Body, Controller, Post, UseGuards, Request, Get, UseInterceptors, UploadedFiles, Param, Patch, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto';
import { GetUser, Public } from './decorator';
import { CreatePTDto } from './dto/create-pt.dto';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { ApprovePTDto } from './dto/approve-pt.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  @Public()
  @Post('register')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
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

  @Public()
  @Post('register-pt')
  @UseInterceptors(FilesInterceptor('certificates', 5))
  async registerPT(
    @Body() createPTDto: CreatePTDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.authService.registerPT(createPTDto, files);
  }

  @Patch('approve-pt')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 4) // Admin hoặc Gym Owner
  async approvePT(
    @Body() approvePTDto: ApprovePTDto,
    @GetUser('user_id') approverId: number
  ) {
    return this.authService.approvePT(approvePTDto, approverId);
  }

  @Get('pending-pts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 4) // Admin hoặc Gym Owner
  async getPendingPTs(@GetUser() user: any) {
    const where: any = {
      role_id: 3, // PT role
      Status_id: 1 // Pending status
    };

    // Nếu là gym owner, chỉ lấy các PT đăng ký vào gym của họ
    if (user.role_id === 4) {
      where.gym = user.username;
    }

    const pendingPTs = await this.prisma.user.findMany({
      where,
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        gym: true,
        Status_id: true,
        certificate: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return pendingPTs;
  }

  @Public()
  @Get('gyms')
  async getGyms() {
    return this.authService.getGyms();
  }
} 