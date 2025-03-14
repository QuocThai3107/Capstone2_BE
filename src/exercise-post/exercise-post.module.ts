import { Module } from '@nestjs/common';
import { ExercisePostService } from './exercise-post.service';
import { ExercisePostController } from './exercise-post.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ExercisePostController],
  providers: [ExercisePostService],
  exports: [ExercisePostService]
})
export class ExercisePostModule {} 