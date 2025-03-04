import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Xin chào từ NestJS!';
  }

  // Ví dụ về một method sử dụng Prisma
  async getAllUsers() {
    return this.prisma.user.findMany();
  }
} 