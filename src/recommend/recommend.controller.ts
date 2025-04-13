import { Controller, Get, UseGuards } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator';

@Controller('recommend')
@UseGuards(JwtAuthGuard)
export class RecommendController {
  constructor(private recommendService: RecommendService) {}

  @Get('health-based')
  async getHealthBasedRecommendations(@GetUser('user_id') userId: number) {
    return this.recommendService.getHealthBasedRecommendations(userId);
  }
} 