import { Module } from '@nestjs/common';
import { PlanSlotsController } from './plan-slots.controller';
import { PlanSlotsService } from './plan-slots.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PlanSlotsController],
  providers: [PlanSlotsService, PrismaService],
  exports: [PlanSlotsService],
})
export class PlanSlotsModule {} 