import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { PlanSlotsModule } from './plan-slots/plan-slots.module';

@Module({
  imports: [PrismaModule, UsersModule, PlansModule, PlanSlotsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 