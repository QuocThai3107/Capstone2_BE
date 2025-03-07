import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MulterFile } from '../interfaces/file.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        name: createUserDto.name,
        roleId: createUserDto.roleId,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        roleId: true,
        statusId: true,
        imgUrl: true,
        introduction: true,
        healthInformation: true,
        illness: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        roleId: true,
        statusId: true,
        imgUrl: true,
        introduction: true,
        healthInformation: true,
        illness: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        roleId: true,
        statusId: true,
        imgUrl: true,
        introduction: true,
        healthInformation: true,
        illness: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(id: number, updateUserDto: UpdateUserDto, file?: MulterFile) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const data: any = { ...updateUserDto };

    if (file) {
      if (existingUser.imgUrl) {
        const publicId = existingUser.imgUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }

      const uploadResult = await this.cloudinaryService.uploadImage(file);
      data.imgUrl = uploadResult.url;
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phoneNum: data.phoneNum,
        imgUrl: data.imgUrl,
        introduction: data.introduction,
        healthInformation: data.healthInformation,
        illness: data.illness,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        roleId: true,
        statusId: true,
        imgUrl: true,
        introduction: true,
        healthInformation: true,
        illness: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateAdmin(id: number, updateUserAdminDto: UpdateUserAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const data: any = { ...updateUserAdminDto };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        password: data.password,
        roleId: data.roleId,
        statusId: data.statusId,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        roleId: true,
        statusId: true,
        imgUrl: true,
        introduction: true,
        healthInformation: true,
        illness: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
} 