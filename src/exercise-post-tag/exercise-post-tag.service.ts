import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExercisePostTagDto, UpdateExercisePostTagDto } from './dto';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class ExercisePostTagService {
  constructor(private prisma: PrismaService) {}

  // Tag management methods
  async createTag(dto: CreateTagDto) {
    return this.prisma.tag.create({
      data: dto
    });
  }

  async findAllTags() {
    return this.prisma.tag.findMany();
  }

  async removeTag(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { id }
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return this.prisma.tag.delete({
      where: { id }
    });
  }

  // Exercise Post Tag methods
  async create(dto: CreateExercisePostTagDto) {
    // Kiểm tra exercisePost có tồn tại không
    const exercisePost = await this.prisma.exercisePost.findUnique({
      where: { id: dto.exercisePostId }
    });

    if (!exercisePost) {
      throw new NotFoundException(`ExercisePost with ID ${dto.exercisePostId} not found`);
    }

    // Kiểm tra tag có tồn tại không
    const tag = await this.prisma.tag.findUnique({
      where: { id: dto.tagId }
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${dto.tagId} not found`);
    }

    return this.prisma.exercisepostTag.create({
      data: dto,
      include: {
        exercisePost: true,
        tag: true
      }
    });
  }

  async createMany(dtos: CreateExercisePostTagDto[]) {
    const createdTags = await Promise.all(
      dtos.map(dto => this.create(dto))
    );
    return createdTags;
  }

  async findAll() {
    return this.prisma.exercisepostTag.findMany({
      include: {
        exercisePost: true,
        tag: true
      }
    });
  }

  async findByExercisePost(exercisePostId: number) {
    return this.prisma.exercisepostTag.findMany({
      where: {
        exercisePostId
      },
      include: {
        tag: true
      }
    });
  }

  async findByTag(tagId: number) {
    return this.prisma.exercisepostTag.findMany({
      where: {
        tagId
      },
      include: {
        exercisePost: true
      }
    });
  }

  async findOne(exercisePostId: number, tagId: number) {
    const exercisePostTag = await this.prisma.exercisepostTag.findUnique({
      where: {
        exercisePostId_tagId: {
          exercisePostId,
          tagId
        }
      },
      include: {
        exercisePost: true,
        tag: true
      }
    });

    if (!exercisePostTag) {
      throw new NotFoundException(`ExercisePostTag with exercisePostId ${exercisePostId} and tagId ${tagId} not found`);
    }

    return exercisePostTag;
  }

  async remove(exercisePostId: number, tagId: number) {
    // Kiểm tra có tồn tại không
    await this.findOne(exercisePostId, tagId);

    return this.prisma.exercisepostTag.delete({
      where: {
        exercisePostId_tagId: {
          exercisePostId,
          tagId
        }
      }
    });
  }

  async removeAllTags(exercisePostId: number) {
    return this.prisma.exercisepostTag.deleteMany({
      where: {
        exercisePostId
      }
    });
  }
} 