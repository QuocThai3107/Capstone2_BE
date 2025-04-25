import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserHealthService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getUserHealthInfo(userId: number): Promise<{ healthInfo: string; illness: string } | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: userId },
      });
      
      if (!user) {
        return null;
      }
      
      return {
        healthInfo: user.Health_information || '',
        illness: user.illness || 'none',
      };
    } catch (error) {
      console.error('Error getting user health info:', error);
      throw error;
    }
  }
} 