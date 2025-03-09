import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ExercisePostModule } from './exercise-post/exercise-post.module';
import { ExercisePostTagModule } from './exercise-post-tag/exercise-post-tag.module';
import { StepModule } from './step/step.module';
@Module({
  imports: [PrismaModule, ExercisePostModule, ExercisePostTagModule, StepModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}