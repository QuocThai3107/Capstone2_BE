import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaAdapter } from '../prisma/prisma-adapter';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, PrismaAdapter],
  exports: [ChatService],
})
export class ChatModule {} 