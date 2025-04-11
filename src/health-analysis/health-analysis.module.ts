import { Module } from '@nestjs/common';
import { HealthAnalysisController } from './health-analysis.controller';
import { HealthAnalyzer } from '../AI/health_analyzer';

@Module({
  controllers: [HealthAnalysisController],
  providers: [HealthAnalyzer],
  exports: [HealthAnalyzer]
})
export class HealthAnalysisModule {} 