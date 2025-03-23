import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaAdapter } from './prisma-adapter';

@Module({
  providers: [
    PrismaService,
    PrismaAdapter,
  ],
  exports: [
    PrismaService,
    PrismaAdapter,
  ],
})
export class PrismaModule {} 