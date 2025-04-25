import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { UserHealthService } from './user-health.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HealthAnalyzerService } from './health-analyzer.service';

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
  providers: [TagService, UserHealthService, HealthAnalyzerService],
  exports: [TagService],
})
export class TagModule {} 