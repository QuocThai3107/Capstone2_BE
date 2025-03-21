import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStepDto, UpdateStepDto } from './dto';

@Injectable()
export class StepService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStepDto) {
    // Check if exercise post exists
    const exercisePost = await this.prisma.exercisepost.findUnique({
      where: { exercisepost_id: dto.exercisepost_id }
    });

    if (!exercisePost) {
      throw new Error('Exercise post not found');
    }

    return this.prisma.step.create({
      data: {
        exercisepost_id: dto.exercisepost_id,
        step_number: dto.step_number,
        instruction: dto.instruction,
        img_url: dto.img_url
      },
      include: {
        exercisepost: true
      }
    });
  }

  async createMany(dtos: CreateStepDto[]) {
    const createdSteps = await Promise.all(
      dtos.map(dto => this.create(dto))
    );
    return createdSteps;
  }

  async findAll() {
    return this.prisma.step.findMany({
      include: {
        exercisepost: true
      }
    });
  }

  async findByExercisePostId(exercisepost_id: number) {
    return this.prisma.step.findMany({
      where: {
        exercisepost_id
      },
      orderBy: {
        step_number: 'asc'
      },
      include: {
        exercisepost: true
      }
    });
  }

  async findOne(exercisepost_id: number, step_number: string) {
    const step = await this.prisma.step.findUnique({
      where: {
        exercisepost_id_step_number: {
          exercisepost_id,
          step_number
        }
      },
      include: {
        exercisepost: true
      }
    });

    if (!step) {
      throw new Error('Step not found');
    }

    return step;
  }

  async update(exercisepost_id: number, step_number: string, dto: UpdateStepDto) {
    return this.prisma.step.update({
      where: {
        exercisepost_id_step_number: {
          exercisepost_id,
          step_number
        }
      },
      data: {
        instruction: dto.instruction,
        img_url: dto.img_url
      },
      include: {
        exercisepost: true
      }
    });
  }

  async remove(exercisepost_id: number, step_number: string) {
    return this.prisma.step.delete({
      where: {
        exercisepost_id_step_number: {
          exercisepost_id,
          step_number
        }
      }
    });
  }

  async removeByExercisePostId(exercisepost_id: number) {
    return this.prisma.step.deleteMany({
      where: {
        exercisepost_id
      }
    });
  }
} 