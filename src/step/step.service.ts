import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStepDto, UpdateStepDto } from './dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MulterFile } from '../interfaces/file.interface';

@Injectable()
export class StepService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateStepDto, file?: Express.Multer.File) {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      dto.imgUrl = uploadResult.url;
    }

    // Kiểm tra exercisePost có tồn tại không
    const exercisePost = await this.prisma.exercisePost.findUnique({
      where: { id: dto.exercisePostId }
    });

    if (!exercisePost) {
      throw new NotFoundException(`ExercisePost with ID ${dto.exercisePostId} not found`);
    }

    return this.prisma.step.create({
      data: dto
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
        exercisePost: true
      }
    });
  }

  async findByExercisePost(exercisePostId: number) {
    return this.prisma.step.findMany({
      where: {
        exercisePostId
      },
      orderBy: {
        stepNumber: 'asc'
      }
    });
  }

  async findOne(exercisePostId: number, stepNumber: string) {
    const step = await this.prisma.step.findUnique({
      where: {
        exercisePostId_stepNumber: {
          exercisePostId,
          stepNumber
        }
      },
      include: {
        exercisePost: true
      }
    });

    if (!step) {
      throw new NotFoundException(`Step ${stepNumber} for exercisePost ${exercisePostId} not found`);
    }

    return step;
  }

  async update(exercisePostId: number, stepNumber: string, dto: UpdateStepDto, file?: Express.Multer.File) {
    if (file) {
      const existingStep = await this.findOne(exercisePostId, stepNumber);

      if (existingStep?.imgUrl) {
        const publicId = existingStep.imgUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }

      const uploadResult = await this.cloudinaryService.uploadImage(file);
      dto.imgUrl = uploadResult.url;
    }

    // Kiểm tra step có tồn tại không
    await this.findOne(exercisePostId, stepNumber);

    return this.prisma.step.update({
      where: {
        exercisePostId_stepNumber: {
          exercisePostId,
          stepNumber
        }
      },
      data: dto
    });
  }

  async remove(exercisePostId: number, stepNumber: string) {
    // Kiểm tra step có tồn tại không
    await this.findOne(exercisePostId, stepNumber);

    return this.prisma.step.delete({
      where: {
        exercisePostId_stepNumber: {
          exercisePostId,
          stepNumber
        }
      }
    });
  }

  async removeAllSteps(exercisePostId: number) {
    return this.prisma.step.deleteMany({
      where: {
        exercisePostId
      }
    });
  }
} 