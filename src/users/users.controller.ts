import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, InternalServerErrorException, Query, Put } from '@nestjs/common';
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
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Public()
  @Get('gym')
  getGymUsers() {
    return this.usersService.getGymUsers();
  }

  @Public()
  @Get('pt')
  getAllPTs() {
    return this.usersService.getAllPTs();
  }

  @Public()
  @Get('gym/pts')
  getPTsByGym() {
    return this.usersService.getPTsByGym();
  }

  @Public()
  @Get('gym/pts/filter')
  getPTsByGymFiltered(
    @Query('role_id') roleId: string,
    @Query('status_id') statusId: string
  ) {
    return this.usersService.getPTsByGymFiltered(
      roleId ? +roleId : undefined,
      statusId ? +statusId : undefined
    );
  }

  @Public()
  @Get('pt/pending')
  getPendingPTs() {
    try {
      return this.usersService.getPendingPTs();
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @Public()
  @Get('pt/:id')
  getPTDetail(@Param('id') id: string) {
    return this.usersService.getPTDetail(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getMyProfile(@GetUser('user_id') userId: number) {
    return this.usersService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  checkUserStatus(@GetUser('user_id') userId: number) {
    try {
      return this.usersService.checkUserStatus(userId);
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('pt/profile')
  getMyPTProfile(@GetUser('user_id') userId: number) {
    return this.usersService.getPTProfile(userId);
  }

  @Public()
  @Get('public/:id')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(+id);
  }

  @Public()
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

  @Public()
  @Put('pts/approve/:id')
  approvePT(@Param('id') id: string) {
    try {
      return this.usersService.approvePT(+id);
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @Public()
  @Delete('pts/reject/:id')
  rejectPT(@Param('id') id: string) {
    try {
      return this.usersService.rejectPT(+id);
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}