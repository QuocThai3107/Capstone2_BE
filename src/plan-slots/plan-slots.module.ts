import { Module } from '@nestjs/common';
import { PlanSlotsController } from './plan-slots.controller';
import { PlanSlotsService } from './plan-slots.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlanSlotsController],
  providers: [PlanSlotsService],
  exports: [PlanSlotsService],
})
export class PlanSlotsModule {} 