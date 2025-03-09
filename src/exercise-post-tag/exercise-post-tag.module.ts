import { Module } from '@nestjs/common';
import { ExercisePostTagService } from './exercise-post-tag.service';
import { ExercisePostTagController } from './exercise-post-tag.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExercisePostTagController],
  providers: [ExercisePostTagService],
  exports: [ExercisePostTagService]
})
export class ExercisePostTagModule {} 