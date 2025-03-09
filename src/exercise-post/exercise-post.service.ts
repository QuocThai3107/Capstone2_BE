import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExercisePostDto, UpdateExercisePostDto } from './dto';

@Injectable()
export class ExercisePostService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExercisePostDto) {
    const { steps, tagIds, ...exercisePostData } = dto;

    return this.prisma.exercisePost.create({
      data: {
        ...exercisePostData,
        steps: {
          create: steps?.map(step => ({
            ...step
          }))
        },
        tags: {
          create: tagIds?.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        }
      },
      include: {
        steps: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.exercisePost.findMany({
      include: {
        steps: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.exercisePost.findUnique({
      where: { id },
      include: {
        steps: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async update(id: number, dto: UpdateExercisePostDto) {
    const { steps, tagIds, ...exercisePostData } = dto;

    // Xóa các steps cũ nếu có steps mới
    if (steps) {
      await this.prisma.step.deleteMany({
        where: { exercisePostId: id }
      });
    }

    // Xóa các tags cũ nếu có tags mới
    if (tagIds) {
      await this.prisma.exercisepostTag.deleteMany({
        where: { exercisePostId: id }
      });
    }

    return this.prisma.exercisePost.update({
      where: { id },
      data: {
        ...exercisePostData,
        steps: steps ? {
          create: steps.map(step => ({
            ...step
          }))
        } : undefined,
        tags: tagIds ? {
          create: tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined
      },
      include: {
        steps: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  async remove(id: number) {
    return this.prisma.exercisePost.delete({
      where: { id }
    });
  }
} 