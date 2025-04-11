import { Controller, Post, Body } from '@nestjs/common';
import { HealthAnalyzer } from '../AI/health_analyzer';

@Controller('health')
export class HealthAnalysisController {
  constructor(private readonly healthAnalyzer: HealthAnalyzer) {}

  @Post('analyze')
  async analyzeHealth(@Body() data: { health_info: string; illness: string }) {
    try {
      const result = await this.healthAnalyzer.analyze_health_info(
        data.health_info,
        data.illness
      );
      return result;
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
} 