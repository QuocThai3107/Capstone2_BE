import { Controller, Post, Body, Get, Param, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { TagService } from './tag.service';
import { PredictTagsDto, PredictTagsFromHealthDto } from './dto/predict-tags.dto';
import { UserHealthService } from './user-health.service';
import { HealthAnalyzerService, HealthAnalysisResponse } from './health-analyzer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import axios from 'axios';
import { GetUser } from '../auth/decorator';

@Controller('tags')
export class TagController {
  private readonly pythonApiUrl = 'http://localhost:5000';

  constructor(
    private readonly tagService: TagService,
    private readonly userHealthService: UserHealthService,
    private readonly healthAnalyzerService: HealthAnalyzerService,
  ) {}

  @Post('predict')
  async predictTags(@Body() body: PredictTagsDto) {
    try {
      // Gọi API Python để dự đoán tags
      const response = await axios.post(`${this.pythonApiUrl}/predict`, {
        text: body.text
      });

      if (response.data.status === 'success') {
        return {
          status: 'success',
          data: response.data.data
        };
      } else {
        return {
          status: 'error',
          message: response.data.message
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'Không thể kết nối đến service dự đoán tags'
      };
    }
  }

  @Post('predict-from-health')
  async predictTagsFromHealth(@Body() body: PredictTagsFromHealthDto) {
    return this.tagService.predictTagsFromHealthInfo(body.healthInfo, body.illness);
  }

  @Get('predict-for-user/:userId')
  async predictTagsForUser(@Param('userId') userId: string) {
    const userHealthInfo = await this.userHealthService.getUserHealthInfo(parseInt(userId, 10));
    
    if (!userHealthInfo) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return this.tagService.predictTagsFromHealthInfo(
      userHealthInfo.healthInfo,
      userHealthInfo.illness
    );
  }

  @Get('health-analysis/:userId')
  async analyzeUserHealth(@Param('userId') userId: string) {
    try {
      const userHealthInfo = await this.userHealthService.getUserHealthInfo(parseInt(userId, 10));
      
      if (!userHealthInfo) {
        return {
          status: 'error',
          message: 'Không tìm thấy thông tin người dùng'
        };
      }

      const analysis = await this.healthAnalyzerService.analyze_health_info(
        userHealthInfo.healthInfo,
        userHealthInfo.illness
      );

      // Chuyển đổi dữ liệu từ HealthAnalyzerResponse sang HealthAnalysisResponse
      const convertedAnalysis: HealthAnalysisResponse = {
        recommended_tags: [...analysis.workout_tags, ...analysis.health_info_tags],
        exclude_tags: analysis.illness_tags,
        message: analysis.message
      };

      return {
        status: 'success',
        data: {
          userId: parseInt(userId, 10),
          healthInfo: userHealthInfo.healthInfo,
          illness: userHealthInfo.illness,
          recommended_tags: convertedAnalysis.recommended_tags || [],
          exclude_tags: convertedAnalysis.exclude_tags || [],
          message: convertedAnalysis.message || ''
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @Get('my-health-analysis')
  @UseGuards(JwtAuthGuard)
  async analyzeMyHealth(@GetUser('user_id') userId: number) {
    try {
      if (!userId) {
        return {
          status: 'error',
          message: 'User ID not found in token'
        };
      }

      const userHealthInfo = await this.userHealthService.getUserHealthInfo(userId);
      
      if (!userHealthInfo) {
        return {
          status: 'error',
          message: 'Không tìm thấy thông tin người dùng'
        };
      }

      const analysis = await this.healthAnalyzerService.analyze_health_info(
        userHealthInfo.healthInfo,
        userHealthInfo.illness
      );

      // Chuyển đổi dữ liệu từ HealthAnalyzerResponse sang HealthAnalysisResponse
      const convertedAnalysis: HealthAnalysisResponse = {
        recommended_tags: [...analysis.workout_tags, ...analysis.health_info_tags],
        exclude_tags: analysis.illness_tags,
        message: analysis.message
      };

      return {
        status: 'success',
        data: {
          userId: userId,
          healthInfo: userHealthInfo.healthInfo,
          illness: userHealthInfo.illness,
          recommended_tags: convertedAnalysis.recommended_tags || [],
          exclude_tags: convertedAnalysis.exclude_tags || [],
          message: convertedAnalysis.message || ''
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @Get('info')
  getTagsInfo() {
    return this.tagService.getTagsInfo();
  }
} 