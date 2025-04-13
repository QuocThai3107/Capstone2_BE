import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { chat } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    user_id: number;
    to_user_id: number;
    content?: string;
    img_url?: string;
  }): Promise<chat> {
    return this.prisma.chat.create({
      data: {
        user_id: data.user_id,
        to_user_id: data.to_user_id,
        content: data.content,
        img_url: data.img_url,
      },
    });
  }

  async findAll(): Promise<chat[]> {
    return this.prisma.chat.findMany();
  }

  async findOne(id: number): Promise<chat> {
    return this.prisma.chat.findUnique({
      where: { chat_id: id },
    });
  }

  async findByUsers(userId: number, toUserId: number): Promise<chat[]> {
    return this.prisma.chat.findMany({
      where: {
        OR: [
          { user_id: userId, to_user_id: toUserId },
          { user_id: toUserId, to_user_id: userId },
        ],
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  async update(id: number, data: {
    content?: string;
    img_url?: string;
  }): Promise<chat> {
    return this.prisma.chat.update({
      where: { chat_id: id },
      data: {
        content: data.content,
        img_url: data.img_url,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: number): Promise<chat> {
    return this.prisma.chat.delete({
      where: { chat_id: id },
    });
  }

  async findAllToUserIds(userId: number): Promise<number[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [
          { user_id: userId },
          { to_user_id: userId }
        ]
      },
      select: {
        user_id: true,
        to_user_id: true
      },
      distinct: ['user_id', 'to_user_id']
    });

    // Lọc ra các to_user_id duy nhất mà user đã nhắn tin
    const toUserIds = new Set<number>();
    chats.forEach(chat => {
      if (chat.user_id === userId) {
        toUserIds.add(chat.to_user_id);
      } else {
        toUserIds.add(chat.user_id);
      }
    });

    return Array.from(toUserIds);
  }
} 