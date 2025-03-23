import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PlanSlotsModule } from '../plan-slots/plan-slots.module';

@Module({
  imports: [PrismaModule, PlanSlotsModule],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {} 