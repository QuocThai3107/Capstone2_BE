import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from '../interfaces/file.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator';
import { HealthAnalyzer } from '../AI/health_analyzer';
import { UserResponse } from './interfaces/user.interface';

@Controller('users')
export class UsersController {
  private healthAnalyzer: HealthAnalyzer;

  constructor(private readonly usersService: UsersService) {
    this.healthAnalyzer = new HealthAnalyzer();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('gym')
  async getGymUsers() {
    return this.usersService.getGymUsers();
  }
  @Get('gym/pts')
  @UseGuards(JwtAuthGuard)
  async getPTsByGym() {
    return this.usersService.getPTsByGym();
  }
  
  @Get('public/:id')
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('profile/:id')
  @UseInterceptors(FileInterceptor('image'))
  updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.usersService.updateProfile(+id, updateUserDto, file);
  }

  @Patch(':id')
  updateAdmin(
    @Param('id') id: string,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    return this.usersService.updateAdmin(+id, updateUserAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('pt/:id')
  @UseGuards(JwtAuthGuard)
  async getPTDetail(@Param('id') id: string) {
    return this.usersService.getPTDetail(+id);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@GetUser('user_id') userId: number) {
    return this.usersService.getProfile(userId);
  }

  @Get('profile/pt/me')
  @UseGuards(JwtAuthGuard)
  async getMyPTProfile(@GetUser('user_id') userId: number) {
    return this.usersService.getPTProfile(userId);
  }

  @Get('profile/me/health-analysis')
  @UseGuards(JwtAuthGuard)
  async analyzeMyHealth(@GetUser('user_id') userId: number) {
    const user = await this.usersService.getProfile(userId);
    
    if (!user) {
      return {
        message: 'Không tìm thấy thông tin người dùng',
        tags: []
      };
    }

    const analysis = this.healthAnalyzer.analyze_health_info(
      user.data.Health_information,
      user.data.illness
    );

    return {
      userId: user.data.user_id,
      healthInfo: user.data.Health_information,
      illness: user.data.illness,
      ...analysis
    };
  }

  @Get(':id/health-analysis')
  async analyzeUserHealth(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(+id);
      
      if (!user) {
        return {
          status: 'error',
          message: 'User not found'
        };
      }

      const userResponse: UserResponse = {
        status: 'success',
        data: user
      };

      const result = await this.healthAnalyzer.analyze_health_info(
        userResponse.data.Health_information || '',
        userResponse.data.illness || ''
      );

      return {
        status: 'success',
        data: {
          userId: userResponse.data.user_id,
          healthInfo: userResponse.data.Health_information,
          illness: userResponse.data.illness,
          analysis: result
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
} 