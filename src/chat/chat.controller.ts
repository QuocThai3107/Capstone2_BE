import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { chat } from '@prisma/client';
import { Public } from '../auth/decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: {
    user_id: number;
    to_user_id: number;
    content?: string;
    img_url?: string;
  }) {
    return this.chatService.create(createChatDto);
  }

  @Public()
  @Get('users/:userId/chat-users')
  async getAllChatUsers(@Param('userId') userId: string) {
    return this.chatService.getAllChatUsers(+userId);
  }

  @Get('users/:userId/contacts')
  findAllToUserIds(@Param('userId') userId: string) {
    return this.chatService.findAllToUserIds(+userId);
  }

  @Get('users/:userId/:toUserId')
  findByUsers(
    @Param('userId') userId: string,
    @Param('toUserId') toUserId: string,
  ) {
    return this.chatService.findByUsers(+userId, +toUserId);
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChatDto: {
      content?: string;
      img_url?: string;
    },
  ) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
} 