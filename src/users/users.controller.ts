import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFile } from '../interfaces/file.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser, Public } from '../auth/decorator';
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

  constructor(private readonly usersService: UsersService) {
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @Get('gym')
  async getGymUsers() {
    return this.usersService.getGymUsers();
  }

  @Public()
  @Get('gym/pts')
  async getPTsByGym() {
    return this.usersService.getPTsByGym();
  }

  @Public()
  @Get('pt')
  async getAllPTs() {
    return this.usersService.getAllPTs();
  }

 
  @Public()
  @Get('public/:id')
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(+id);
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

  @Public()
  @Get('pt/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingPTs() {
    try {
      const result = await this.usersService.getPendingPTs();
      return {
        status: 'success',
        data: result
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
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

  @Public()
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
}