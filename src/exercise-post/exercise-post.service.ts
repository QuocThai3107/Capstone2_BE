import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExercisePostDto, UpdateExercisePostDto } from './dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ExercisePostService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createExercisePostDto: CreateExercisePostDto) {
    return this.prisma.exercisepost.create({
      data: {
        name: createExercisePostDto.name,
        description: createExercisePostDto.description,
        img_url: createExercisePostDto.imgUrl,
        video_rul: createExercisePostDto.videoUrl,
        step: createExercisePostDto.steps ? {
          createMany: {
            data: createExercisePostDto.steps.map(step => ({
              step_number: step.stepNumber,
              instruction: step.instruction,
              img_url: step.imgUrl
            }))
          }
        } : undefined,
        exerciseposttag: createExercisePostDto.tagIds?.length > 0 ? {
          createMany: {
            data: createExercisePostDto.tagIds.map(tagId => ({
              tag_id: tagId
            }))
          }
        } : undefined
      },
      include: {
        step: true,
        exerciseposttag: {
          include: {
            tag: true
          }
        }
      }
    });

    return result;
  }

  async findAll() {
    return this.prisma.exercisepost.findMany({
      include: {
        step: true,
        exerciseposttag: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.exercisepost.findUnique({
      where: { exercisepost_id: id },
      include: {
        step: true,
        exerciseposttag: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async update(id: number, updateExercisePostDto: UpdateExercisePostDto) {
    // Delete old steps
    if (updateExercisePostDto.steps) {
      await this.prisma.step.deleteMany({
        where: { exercisepost_id: id }
      });
    }

    // Delete old tags
    if (updateExercisePostDto.tagIds) {
      await this.prisma.exerciseposttag.deleteMany({
        where: { exercisepost_id: id }
      });
    }

    return this.prisma.exercisepost.update({
      where: { exercisepost_id: id },
      data: {
        name: updateExercisePostDto.name,
        description: updateExercisePostDto.description,
        img_url: updateExercisePostDto.imgUrl,
        video_rul: updateExercisePostDto.videoUrl,
        step: updateExercisePostDto.steps ? {
          createMany: {
            data: updateExercisePostDto.steps.map(step => ({
              step_number: step.stepNumber,
              instruction: step.instruction,
              img_url: step.imgUrl
            }))
          }
        } : undefined,
        exerciseposttag: updateExercisePostDto.tagIds?.length > 0 ? {
          createMany: {
            data: updateExercisePostDto.tagIds.map(tagId => ({
              tag_id: tagId
            }))
          }
        } : undefined
      },
      include: {
        step: true,
        exerciseposttag: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async remove(id: number) {
    return this.prisma.exercisepost.delete({
      where: { exercisepost_id: id }
    });
  }
} 