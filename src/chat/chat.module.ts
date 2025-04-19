import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaAdapter } from '../prisma/prisma-adapter';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, PrismaService, PrismaAdapter],
  exports: [ChatService],
})
export class ChatModule {} 