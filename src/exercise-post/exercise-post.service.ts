import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExercisePostDto } from './dto/create-exercise-post.dto';
import { UpdateExercisePostDto } from './dto/update-exercise-post.dto';

@Injectable()
export class ExercisePostService {
  constructor(private prisma: PrismaService) {}

  async create(createExercisePostDto: CreateExercisePostDto, file: Express.Multer.File, userId: number) {
    const { name, description, tagIds, steps, video_rul } = createExercisePostDto;
    
    // Tạo bài tập
    const exercisePost = await this.prisma.exercisepost.create({
      data: {
        name,
        description,
        img_url: file ? file.filename : null,
        video_rul,
        user_id: userId,
        status_id: 1, // Chờ duyệt
        step: {
          create: steps?.map((step, index) => ({
            step_number: (index + 1).toString(),
            instruction: step.instruction,
            img_url: step.img_url
          }))
        },
        exerciseposttag: {
          create: Array.isArray(tagIds) ? tagIds.map(tagId => ({
            tag_id: tagId
          })) : []
        }
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

    return exercisePost;
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

  async update(id: number, updateExercisePostDto: UpdateExercisePostDto, file: Express.Multer.File) {
    const { name, description, tagIds, steps, video_rul } = updateExercisePostDto;

    // Xóa các steps và tags cũ
    await this.prisma.step.deleteMany({
      where: { exercisepost_id: id }
    });

    await this.prisma.exerciseposttag.deleteMany({
      where: { exercisepost_id: id }
    });

    // Cập nhật bài tập
    return this.prisma.exercisepost.update({
      where: { exercisepost_id: id },
      data: {
        name,
        description,
        img_url: file ? file.filename : undefined,
        video_rul,
        step: {
          create: steps?.map((step, index) => ({
            step_number: (index + 1).toString(),
            instruction: step.instruction,
            img_url: step.img_url
          }))
        },
        exerciseposttag: {
          create: Array.isArray(tagIds) ? tagIds.map(tagId => ({
            tag_id: tagId
          })) : []
        }
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

  async getAllTags() {
    return this.prisma.tag.findMany();
  }
} 