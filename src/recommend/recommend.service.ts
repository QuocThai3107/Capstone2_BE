import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class RecommendService {
  constructor(private prisma: PrismaService) {}

  async getHealthBasedRecommendations(userId: number) {
    // Lấy thông tin sức khỏe của user
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        Health_information: true,
        illness: true,
      },
    });

    // Lấy tất cả tags
    const allTags = await this.prisma.tag.findMany();

    // Gọi Python script
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../AI/tag_recommender.py'),
      JSON.stringify({
        health_info: user.Health_information || '',
        illness: user.illness || '',
        tags: allTags,
      }),
    ]);

    return new Promise((resolve, reject) => {
      let result = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(`Process exited with code ${code}`);
          return;
        }

        try {
          const recommendations = JSON.parse(result);
          resolve(recommendations);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
} 