import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlanSlotsModule } from '../plan-slots/plan-slots.module';

@Module({
  imports: [PlanSlotsModule],
  controllers: [PlansController],
  providers: [PlansService, PrismaService],
  exports: [PlansService],
})
export class PlansModule {} 