import { Module } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { ExercisePostController } from './exercise-post.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExercisePostController],
  providers: [ExercisePostService],
  exports: [ExercisePostService]
})
export class ExercisePostModule {} 