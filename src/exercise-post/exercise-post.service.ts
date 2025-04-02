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

  async create(createExercisePostDto: CreateExercisePostDto, file?: Express.Multer.File) {
    let imgUrl = createExercisePostDto.imgUrl;
    
    // Nếu có file upload, xử lý upload lên Cloudinary
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imgUrl = uploadResult.url;
    }

    // Chuyển đổi kiểu dữ liệu để phù hợp với Prisma
    const userId = typeof createExercisePostDto.user_id === 'string' 
      ? parseInt(createExercisePostDto.user_id) 
      : createExercisePostDto.user_id;

    // Xử lý tagIds có thể là string, string[] hoặc number[]
    let tagIds: number[] = [];
    if (createExercisePostDto.tagIds) {
      if (typeof createExercisePostDto.tagIds === 'string') {
        // Nếu là string đơn (có thể từ form-data)
        tagIds = [parseInt(createExercisePostDto.tagIds)];
      } else if (Array.isArray(createExercisePostDto.tagIds)) {
        // Nếu là mảng (string[] hoặc number[])
        tagIds = createExercisePostDto.tagIds.map(id => 
          typeof id === 'string' ? parseInt(id) : id
        );
      }
    }
    
    const result = await this.prisma.exercisepost.create({
      data: {
        name: createExercisePostDto.name,
        description: createExercisePostDto.description,
        img_url: imgUrl,
        video_rul: createExercisePostDto.video_rul,
        user: {
          connect: {
            user_id: userId
          }
        },
        step: createExercisePostDto.steps ? {
          createMany: {
            data: (Array.isArray(createExercisePostDto.steps) ? createExercisePostDto.steps : []).map(step => ({
              step_number: typeof step.stepNumber === 'number' 
                ? step.stepNumber.toString() 
                : step.stepNumber,
              instruction: step.instruction,
              img_url: step.imgUrl
            }))
          }
        } : undefined,
        exerciseposttag: tagIds.length > 0 ? {
          createMany: {
            data: tagIds.map(tagId => ({
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

  async update(id: number, updateExercisePostDto: UpdateExercisePostDto, file?: Express.Multer.File) {
    // Xử lý file upload nếu có
    let imgUrl = updateExercisePostDto.imgUrl;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      imgUrl = uploadResult.url;
    }

    // Chuyển đổi kiểu dữ liệu tagIds
    let tagIds: number[] = [];
    if (updateExercisePostDto.tagIds) {
      if (typeof updateExercisePostDto.tagIds === 'string') {
        tagIds = [parseInt(updateExercisePostDto.tagIds)];
      } else if (Array.isArray(updateExercisePostDto.tagIds)) {
        tagIds = updateExercisePostDto.tagIds.map(id => 
          typeof id === 'string' ? parseInt(id) : id
        );
      }
    }

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
        img_url: imgUrl,
        video_rul: updateExercisePostDto.video_rul,
        step: updateExercisePostDto.steps ? {
          createMany: {
            data: (Array.isArray(updateExercisePostDto.steps) ? updateExercisePostDto.steps : []).map(step => ({
              step_number: typeof step.stepNumber === 'number' 
                ? step.stepNumber.toString() 
                : step.stepNumber,
              instruction: step.instruction,
              img_url: step.imgUrl
            }))
          }
        } : undefined,
        exerciseposttag: tagIds.length > 0 ? {
          createMany: {
            data: tagIds.map(tagId => ({
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