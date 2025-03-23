import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserAdminDto } from '../dto/update-user-admin.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { MulterFile } from '../../interfaces/file.interface';
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
        role_id: createUserDto.role_id,
        email: createUserDto.email,
        phoneNum: createUserDto.phoneNum,
        Status_id: createUserDto.Status_id
      },
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        role_id: true,
        Status_id: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        role_id: true,
        Status_id: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        role_id: true,
        Status_id: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
} 