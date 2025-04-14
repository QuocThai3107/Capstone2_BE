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

  // Lấy tất cả các tags
  async getAllTags() {
    try {
      const tags = await this.prisma.tag.findMany({
        select: {
          tag_id: true,
          tag_name: true
        }
      });

      return {
        status: 'success',
        data: tags
      };
    } catch (error) {
      console.error('Error getting all tags:', error);
      throw new Error('Có lỗi khi lấy danh sách tags');
    }
  }

  // Tìm bài tập theo tên tag
  async searchByTagNames(tagNames: string[]) {
    try {
      // Tìm bài tập có chứa TẤT CẢ các tag trong danh sách (AND condition)
      const exercises = await this.prisma.exercisepost.findMany({
        where: {
          AND: tagNames.map(tagName => ({
            exerciseposttag: {
              some: {
                tag: {
                  tag_name: {
                    contains: tagName.toLowerCase()
                  }
                }
              }
            }
          }))
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

      if (exercises.length === 0) {
        return {
          status: 'success',
          message: 'Không tìm thấy bài tập nào phù hợp với tất cả các tag đã chọn',
          data: []
        };
      }

      return {
        status: 'success',
        data: exercises.map(exercise => ({
          exercisepost_id: exercise.exercisepost_id,
          name: exercise.name,
          description: exercise.description,
          img_url: exercise.img_url,
          video_rul: exercise.video_rul,
          steps: exercise.step,
          tags: exercise.exerciseposttag.map(tag => ({
            tag_id: tag.tag.tag_id,
            tag_name: tag.tag.tag_name
          }))
        }))
      };
    } catch (error) {
      console.error('Error searching exercises by tag names:', error);
      throw new Error('Có lỗi khi tìm bài tập theo tags');
    }
  }

  async search(searchParams: { tags: string[], name?: string, description?: string }) {
    try {
      const where: any = {};
      
      // Xử lý tìm kiếm theo tags
      if (searchParams.tags.length > 0) {
        where.AND = searchParams.tags.map(tagId => ({
          exerciseposttag: {
            some: {
              tag_id: parseInt(tagId)
            }
          }
        }));
      }

      // Tìm kiếm theo tên
      if (searchParams.name) {
        where.name = {
          contains: searchParams.name.toLowerCase()
        };
      }

      // Tìm kiếm theo mô tả
      if (searchParams.description) {
        where.description = {
          contains: searchParams.description.toLowerCase()
        };
      }

      const exercises = await this.prisma.exercisepost.findMany({
        where,
        include: {
          step: true,
          exerciseposttag: {
            include: {
              tag: true
            }
          }
        }
      });

      return {
        status: 'success',
        data: exercises.map(exercise => ({
          exercisepost_id: exercise.exercisepost_id,
          name: exercise.name,
          description: exercise.description,
          img_url: exercise.img_url,
          video_rul: exercise.video_rul,
          steps: exercise.step,
          tags: exercise.exerciseposttag.map(tag => ({
            tag_id: tag.tag.tag_id,
            tag_name: tag.tag.tag_name
          }))
        }))
      };
    } catch (error) {
      console.error('Error searching exercises:', error);
      throw new Error('Có lỗi khi tìm kiếm bài tập');
    }
  }

  async findByTags(tagIds: number[]) {
    try {
      const exercises = await this.prisma.exercisepost.findMany({
        where: {
          AND: tagIds.map(tagId => ({
            exerciseposttag: {
              some: {
                tag_id: tagId
              }
            }
          }))
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

      return {
        status: 'success',
        data: exercises.map(exercise => ({
          exercisepost_id: exercise.exercisepost_id,
          name: exercise.name,
          description: exercise.description,
          img_url: exercise.img_url,
          video_rul: exercise.video_rul,
          steps: exercise.step,
          tags: exercise.exerciseposttag.map(tag => ({
            tag_id: tag.tag.tag_id,
            tag_name: tag.tag.tag_name
          }))
        }))
      };
    } catch (error) {
      console.error('Error finding exercises by tags:', error);
      throw new Error('Có lỗi khi tìm bài tập theo tags');
    }
  }
} 