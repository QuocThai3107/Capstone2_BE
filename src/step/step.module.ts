import { Module } from '@nestjs/common';
import { StepService } from './step.service';
import { StepController } from './step.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StepController],
  providers: [StepService],
  exports: [StepService]
})
export class StepModule {} 