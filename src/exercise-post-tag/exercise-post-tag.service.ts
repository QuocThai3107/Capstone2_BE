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
      data: {
        tag_name: dto.tag_name
      }
    });
  }

  async findAllTags() {
    return this.prisma.tag.findMany();
  }

  async findTagById(id: number) {
    return this.prisma.tag.findUnique({
      where: { tag_id: id }
    });
  }

  async removeTag(id: number) {
    return this.prisma.tag.delete({
      where: { tag_id: id }
    });
  }

  // Exercise post tag management methods
  async create(dto: CreateExercisePostTagDto) {
    const exercisePost = await this.prisma.exercisepost.findUnique({
      where: { exercisepost_id: dto.exercisePostId }
    });

    if (!exercisePost) {
      throw new NotFoundException(`Exercise post with ID ${dto.exercisePostId} not found`);
    }

    return this.prisma.exerciseposttag.create({
      data: {
        exercisepost_id: dto.exercisePostId,
        tag_id: dto.tagId
      },
      include: {
        exercisepost: true,
        tag: true
      }
    });
  }

  async findAll() {
    return this.prisma.exerciseposttag.findMany({
      include: {
        exercisepost: true,
        tag: true
      }
    });
  }

  async findByExercisePostId(exercisePostId: number) {
    return this.prisma.exerciseposttag.findMany({
      where: {
        exercisepost_id: exercisePostId
      },
      include: {
        exercisepost: true,
        tag: true
      }
    });
  }

  async findByTagId(tagId: number) {
    return this.prisma.exerciseposttag.findMany({
      where: {
        tag_id: tagId
      },
      include: {
        exercisepost: true,
        tag: true
      }
    });
  }

  async findOne(exercisePostId: number, tagId: number) {
    return this.prisma.exerciseposttag.findUnique({
      where: {
        exercisepost_id_tag_id: {
          exercisepost_id: exercisePostId,
          tag_id: tagId
        }
      },
      include: {
        exercisepost: true,
        tag: true
      }
    });
  }

  async update(exercisePostId: number, tagId: number, dto: UpdateExercisePostTagDto) {
    const exercisePostTag = await this.findOne(exercisePostId, tagId);
    if (!exercisePostTag) {
      throw new NotFoundException(`Exercise post tag not found`);
    }

    if (dto.tagId) {
      const tag = await this.findTagById(dto.tagId);
      if (!tag) {
        throw new NotFoundException(`Tag with ID ${dto.tagId} not found`);
      }
    }

    return this.prisma.exerciseposttag.update({
      where: {
        exercisepost_id_tag_id: {
          exercisepost_id: exercisePostId,
          tag_id: tagId
        }
      },
      data: {
        tag_id: dto.tagId
      },
      include: {
        exercisepost: true,
        tag: true
      }
    });
  }

  async remove(exercisePostId: number, tagId: number) {
    return this.prisma.exerciseposttag.delete({
      where: {
        exercisepost_id_tag_id: {
          exercisepost_id: exercisePostId,
          tag_id: tagId
        }
      }
    });
  }

  async removeByExercisePostId(exercisePostId: number) {
    return this.prisma.exerciseposttag.deleteMany({
      where: {
        exercisepost_id: exercisePostId
      }
    });
  }

  // Implementing the missing createMany method
  async createMany(dtos: CreateExercisePostTagDto[]) {
    const results = [];
    for (const dto of dtos) {
      results.push(await this.create(dto));
    }
    return results;
  }
} 