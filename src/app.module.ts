import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { PlanSlotsModule } from './plan-slots/plan-slots.module';
import { ExercisePostModule } from './exercise-post/exercise-post.module';
import { ExercisePostTagModule } from './exercise-post-tag/exercise-post-tag.module';
import { StepModule } from './step/step.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PlansModule,
    PlanSlotsModule,
    ExercisePostModule,
    ExercisePostTagModule,
    StepModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}