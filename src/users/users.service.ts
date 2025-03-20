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
    try {
      console.log('=== Bắt đầu cập nhật profile ===');
      console.log('ID người dùng:', id);
      console.log('Dữ liệu nhận được:', JSON.stringify(updateUserDto, null, 2));

      const existingUser = await this.prisma.user.findUnique({
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
        }
      });

      if (!existingUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      console.log('Thông tin người dùng hiện tại:', JSON.stringify(existingUser, null, 2));

      const updateData: any = {};

      // Xử lý các trường cập nhật
      if ('name' in updateUserDto) {
        updateData.name = updateUserDto.name?.trim() || null;
        console.log('Cập nhật tên:', updateData.name);
      }

      if ('email' in updateUserDto) {
        updateData.email = updateUserDto.email?.trim() || null;
        console.log('Cập nhật email:', updateData.email);
      }

      // Xử lý số điện thoại
      if ('phoneNum' in updateUserDto) {
        console.log('Xử lý số điện thoại:', updateUserDto.phoneNum);
        
        if (!updateUserDto.phoneNum || updateUserDto.phoneNum.trim() === '') {
          console.log('Số điện thoại rỗng -> null');
          updateData.phoneNum = null;
        } else {
          const phoneNum = updateUserDto.phoneNum.trim();
          console.log('Số điện thoại sau khi trim:', phoneNum);
          
          if (!/^\d{10}$/.test(phoneNum)) {
            throw new Error('Số điện thoại phải có đúng 10 chữ số');
          }
          
          updateData.phoneNum = phoneNum;
          console.log('Số điện thoại hợp lệ, sẽ cập nhật:', updateData.phoneNum);
        }
      }

      if ('introduction' in updateUserDto) {
        updateData.introduction = updateUserDto.introduction?.trim() || null;
        console.log('Cập nhật giới thiệu:', updateData.introduction);
      }

      if ('healthInformation' in updateUserDto) {
        updateData.healthInformation = updateUserDto.healthInformation?.trim() || null;
        console.log('Cập nhật thông tin sức khỏe:', updateData.healthInformation);
      }

      if ('illness' in updateUserDto) {
        updateData.illness = updateUserDto.illness?.trim() || null;
        console.log('Cập nhật thông tin bệnh lý:', updateData.illness);
      }

      // Xử lý file ảnh
      if (file) {
        if (existingUser.imgUrl) {
          const publicId = existingUser.imgUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        }
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        updateData.imgUrl = uploadResult.url;
        console.log('Cập nhật ảnh:', updateData.imgUrl);
      }

      console.log('=== Dữ liệu sẽ cập nhật ===');
      console.log(JSON.stringify(updateData, null, 2));

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
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

      console.log('=== Kết quả cập nhật ===');
      console.log(JSON.stringify(updatedUser, null, 2));

      return updatedUser;
    } catch (error) {
      console.error('=== Lỗi cập nhật ===');
      console.error('Chi tiết:', error);
      throw error;
    }
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

  async getPublicProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        imgUrl: true,
        introduction: true,
        healthInformation: true,
        illness: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
} 