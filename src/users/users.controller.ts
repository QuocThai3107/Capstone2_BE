import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from '../interfaces/file.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser, Public } from '../auth/decorator';
import { HealthAnalyzer } from '../AI/health_analyzer';
import { UserResponse } from './interfaces/user.interface';

interface HealthAnalysisResponse {
  recommended_tags: string[];
  exclude_tags: string[];
  message: string;
}

interface HealthAnalyzerResponse {
  workout_tags: string[];
  health_info_tags: string[];
  illness_tags: string[];
  message: string;
}

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
<<<<<<< HEAD
=======

>>>>>>> ba3762edd01abfcbcf54b0f2f882cb6bd1b127cc
  @Public()
  @Get('gym')
  async getGymUsers() {
    return this.usersService.getGymUsers();
  }
<<<<<<< HEAD
=======

>>>>>>> ba3762edd01abfcbcf54b0f2f882cb6bd1b127cc
  @Public()
  @Get('gym/pts')
  @UseGuards(JwtAuthGuard)
  async getPTsByGym() {
    return this.usersService.getPTsByGym();
  }
<<<<<<< HEAD
=======
  
>>>>>>> ba3762edd01abfcbcf54b0f2f882cb6bd1b127cc
  @Public()
  @Get('public/:id')
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(+id);
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  @Public()
  @Get('profile/me/health-analysis')
  @UseGuards(JwtAuthGuard)
  async analyzeMyHealth(@GetUser('user_id') userId: number) {
    try {
      if (!userId) {
        return {
          status: 'error',
          message: 'User ID not found in token'
        };
      }

      const user = await this.usersService.getProfile(userId);
      
      if (!user) {
        return {
          status: 'error',
          message: 'Không tìm thấy thông tin người dùng'
        };
      }

      const analysis = await this.healthAnalyzer.analyze_health_info(
        user.data.Health_information || '',
        user.data.illness || ''
      ) as HealthAnalyzerResponse;

      // Chuyển đổi dữ liệu từ HealthAnalyzerResponse sang HealthAnalysisResponse
      const convertedAnalysis: HealthAnalysisResponse = {
        recommended_tags: [...analysis.workout_tags, ...analysis.health_info_tags],
        exclude_tags: analysis.illness_tags,
        message: analysis.message
      };

      return {
        status: 'success',
        data: {
          userId: user.data.user_id,
          healthInfo: user.data.Health_information,
          illness: user.data.illness,
          recommended_tags: convertedAnalysis.recommended_tags || [],
          exclude_tags: convertedAnalysis.exclude_tags || [],
          message: convertedAnalysis.message || ''
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
<<<<<<< HEAD
=======

>>>>>>> ba3762edd01abfcbcf54b0f2f882cb6bd1b127cc
  @Public()
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

      const analysis = await this.healthAnalyzer.analyze_health_info(
        userResponse.data.Health_information || '',
        userResponse.data.illness || ''
      ) as HealthAnalyzerResponse;

      // Chuyển đổi dữ liệu từ HealthAnalyzerResponse sang HealthAnalysisResponse
      const convertedAnalysis: HealthAnalysisResponse = {
        recommended_tags: [...analysis.workout_tags, ...analysis.health_info_tags],
        exclude_tags: analysis.illness_tags,
        message: analysis.message
      };

      return {
        status: 'success',
        data: {
          userId: userResponse.data.user_id,
          healthInfo: userResponse.data.Health_information,
          illness: userResponse.data.illness,
          recommended_tags: convertedAnalysis.recommended_tags || [],
          exclude_tags: convertedAnalysis.exclude_tags || [],
          message: convertedAnalysis.message || ''
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
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

  @Patch('pt/approve/:id')
  @UseGuards(JwtAuthGuard)
  async approvePT(@Param('id') id: string) {
    try {
      const result = await this.usersService.updateStatus(+id, 2); // 2 = active
      return {
        status: 'success',
        message: 'PT đã được phê duyệt',
        data: result
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @Delete('pt/reject/:id')
  @UseGuards(JwtAuthGuard)
  async rejectPT(@Param('id') id: string) {
    try {
      const result = await this.usersService.remove(+id);
      return {
        status: 'success',
        message: 'PT đã bị từ chối và xóa',
        data: result
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}