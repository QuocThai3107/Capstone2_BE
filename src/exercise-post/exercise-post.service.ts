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

  async create(dto: CreateExercisePostDto, file?: Express.Multer.File) {
    const { steps: stepsRaw, tagIds: tagIdsRaw, ...exercisePostData } = dto;

    // Parse steps từ string JSON nếu có
    let steps;
    if (typeof stepsRaw === 'string' && stepsRaw.trim()) {
      try {
        steps = JSON.parse(stepsRaw);
      } catch (error) {
        steps = undefined;
      }
    } else {
      steps = stepsRaw;
    }

    // Parse tagIds từ string JSON nếu có
    let tagIds;
    if (typeof tagIdsRaw === 'string' && tagIdsRaw.trim()) {
      try {
        tagIds = JSON.parse(tagIdsRaw);
      } catch (error) {
        tagIds = undefined;
      }
    } else {
      tagIds = tagIdsRaw;
    }

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      exercisePostData.imgUrl = uploadResult.url;
    }

    // Tạo exercise post và các steps liên quan
    const result = await this.prisma.exercisePost.create({
      data: {
        ...exercisePostData,
        steps: steps ? {
          create: steps.map(step => ({
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            imgUrl: step.imgUrl
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

    return result;
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

  async update(id: number, dto: UpdateExercisePostDto, file?: Express.Multer.File) {
    const { steps: stepsRaw, tagIds: tagIdsRaw, ...exercisePostData } = dto;

    // Parse steps từ string JSON nếu có
    let steps;
    if (typeof stepsRaw === 'string' && stepsRaw.trim()) {
      try {
        steps = JSON.parse(stepsRaw);
      } catch (error) {
        steps = undefined;
      }
    } else {
      steps = stepsRaw;
    }

    // Parse tagIds từ string JSON nếu có
    let tagIds;
    if (typeof tagIdsRaw === 'string' && tagIdsRaw.trim()) {
      try {
        tagIds = JSON.parse(tagIdsRaw);
      } catch (error) {
        tagIds = undefined;
      }
    } else {
      tagIds = tagIdsRaw;
    }

    if (file) {
      const existingPost = await this.prisma.exercisePost.findUnique({
        where: { id }
      });

      if (existingPost?.imgUrl) {
        const publicId = existingPost.imgUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }

      const uploadResult = await this.cloudinaryService.uploadImage(file);
      exercisePostData.imgUrl = uploadResult.url;
    }

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
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            imgUrl: step.imgUrl
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