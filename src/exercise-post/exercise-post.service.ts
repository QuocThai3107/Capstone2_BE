import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExercisePostDto } from './dto/create-exercise-post.dto';
import { UpdateExercisePostDto } from './dto/update-exercise-post.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MulterFile } from '../interfaces/file.interface';

@Injectable()
export class ExercisePostService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService
  ) {}

  async create(createExercisePostDto: CreateExercisePostDto, file: MulterFile, userId: number) {
    const { name, description, tagIds, steps, video_rul } = createExercisePostDto;
    
    // Tải ảnh lên Cloudinary nếu có
    let img_url = null;
    if (file) {
      try {
        console.log('Uploading file to Cloudinary:', file.originalname, file.size);
        const cloudinaryResponse = await this.cloudinaryService.uploadImage(file);
        img_url = cloudinaryResponse.secure_url;
        console.log('Cloudinary upload success:', img_url);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
      }
    }
    
    console.log('Creating exercise post with data:', { name, description, img_url, video_rul, userId, tagIds, steps });
    
    // Tạo bài tập
    const exercisePost = await this.prisma.exercisepost.create({
      data: {
        name,
        description,
        img_url,
        video_rul,
        user_id: userId,
        status_id: 1, // Chờ duyệt
        step: {
          create: steps?.map((step, index) => ({
            step_number: (index + 1).toString(),
            instruction: step.instruction,
            img_url: step.img_url
          })) || []
        },
        exerciseposttag: {
          create: Array.isArray(tagIds) ? tagIds.map(tagId => ({
            tag_id: typeof tagId === 'string' ? parseInt(tagId) : tagId
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

  async updateStatus(id: number, status_id: number) {
    return this.prisma.exercisepost.update({
      where: { exercisepost_id: id },
      data: { status_id }
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

  async update(id: number, updateExercisePostDto: any, file: MulterFile) {
    const { name, description, tagIds, steps, video_rul, status_id } = updateExercisePostDto;

    // Xóa các steps và tags cũ
    await this.prisma.step.deleteMany({
      where: { exercisepost_id: id }
    });

    await this.prisma.exerciseposttag.deleteMany({
      where: { exercisepost_id: id }
    });
    
    // Tải ảnh lên Cloudinary nếu có
    let img_url;
    if (file) {
      try {
        console.log('Updating exercise post - uploading file to Cloudinary:', file.originalname, file.size);
        const cloudinaryResponse = await this.cloudinaryService.uploadImage(file);
        img_url = cloudinaryResponse.secure_url;
        console.log('Cloudinary upload success:', img_url);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
      }
    }

    console.log('Updating exercise post with data:', { id, name, description, img_url, video_rul, tagIds, steps, status_id });

    // Cập nhật bài tập
    return this.prisma.exercisepost.update({
      where: { exercisepost_id: id },
      data: {
        name,
        description,
        img_url: file ? img_url : undefined,
        video_rul,
        status_id,
        step: {
          create: steps?.map((step, index) => ({
            step_number: (index + 1).toString(),
            instruction: step.instruction,
            img_url: step.img_url
          })) || []
        },
        exerciseposttag: {
          create: Array.isArray(tagIds) ? tagIds.map(tagId => ({
            tag_id: typeof tagId === 'string' ? parseInt(tagId) : tagId
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
      throw new Error('Có lỗi khi tìm kiếm bài tập theo tags');
    }
  }

  async searchByTags(includeTags: string[], excludeTags: string[]) {
    const exercisePosts = await this.prisma.exercisepost.findMany({
      where: {
        AND: [
          // Include condition: At least one tag matches
          includeTags.length > 0 ? {
            exerciseposttag: {
              some: {
                tag: {
                  tag_name: {
                    in: includeTags
                  }
                }
              }
            }
          } : {},
          // Exclude condition: None of the tags match
          excludeTags.length > 0 ? {
            NOT: {
              exerciseposttag: {
                some: {
                  tag: {
                    tag_name: {
                      in: excludeTags
                    }
                  }
                }
              }
            }
          } : {}
        ]
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

    return exercisePosts;
  }

  async searchByTagsAdvanced(includeTags: string[], excludeTags: string[]) {
    try {
      // Tạo điều kiện tìm kiếm
      const whereCondition: any = {};
      
      // Nếu có includeTags, sử dụng nguyên lý OR (bài tập có ít nhất một trong các tags này)
      if (includeTags && includeTags.length > 0) {
        whereCondition.exerciseposttag = {
          some: {
            tag: {
              tag_name: {
                in: includeTags
              }
            }
          }
        };
      }
      
      // Nếu có excludeTags, sử dụng nguyên lý AND (loại bỏ bài tập có bất kỳ tag nào trong danh sách này)
      const notConditions = [];
      if (excludeTags && excludeTags.length > 0) {
        excludeTags.forEach(tagName => {
          notConditions.push({
            exerciseposttag: {
              some: {
                tag: {
                  tag_name: tagName
                }
              }
            }
          });
        });
      }
      
      // Tìm kiếm bài tập
      const exercisePosts = await this.prisma.exercisepost.findMany({
        where: {
          ...whereCondition,
          NOT: notConditions.length > 0 ? notConditions : undefined
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
        count: exercisePosts.length,
        data: exercisePosts.map(exercise => ({
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
      console.error('Error searching exercises by tags:', error);
      return {
        status: 'error',
        message: 'Có lỗi khi tìm kiếm bài tập theo tags',
        error: error.message
      };
    }
  }
} 