import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanSlotDto } from './dto/create-plan-slot.dto';

@Injectable()
export class PlanSlotsService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanSlotDto: CreatePlanSlotDto) {
    try {
      const { planId, no, note, duration, exercisePostId } = createPlanSlotDto;
      
      // Kiểm tra xem planId có tồn tại không
      const plan = await this.prisma.plan.findUnique({
        where: { id: planId }
      });
      
      if (!plan) {
        throw new NotFoundException(`Plan with ID ${planId} does not exist`);
      }

      // Kiểm tra exercisePostId nếu được cung cấp
      if (exercisePostId) {
        const exercisePost = await this.prisma.exercisePost.findUnique({
          where: { id: exercisePostId }
        });

        if (!exercisePost) {
          throw new NotFoundException(`ExercisePost with ID ${exercisePostId} does not exist`);
        }
      }

      // Tìm ID lớn nhất hiện tại
      const lastPlanSlot = await this.prisma.planSlot.findFirst({
        orderBy: {
          id: 'desc'
        }
      });

      const nextId = lastPlanSlot ? lastPlanSlot.id + 1 : 1;

      return await this.prisma.planSlot.create({
        data: {
          id: nextId,
          planId,
          no: no.toString(),
          note,
          duration,
          exercisePostId
        },
        include: {
          exercisePost: true
        }
      });
    } catch (error) {
      console.error('Create PlanSlot Error:', error);
      throw error;
    }
  }

  async findAll(planId: number) {
    try {
      return await this.prisma.planSlot.findMany({
        where: { planId },
        orderBy: {
          no: 'asc'
        },
        include: {
          exercisePost: true
        }
      });
    } catch (error) {
      console.error('FindAll PlanSlot Error:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.planSlot.findUnique({
        where: { id },
        include: {
          exercisePost: true
        }
      });
    } catch (error) {
      console.error('FindOne PlanSlot Error:', error);
      throw error;
    }
  }

  async update(id: number, updateData: Partial<CreatePlanSlotDto>) {
    try {
      const { no: newNo, exercisePostId, ...rest } = updateData;

      // Kiểm tra exercisePostId nếu được cung cấp và không phải null
      if (exercisePostId !== null && exercisePostId !== undefined) {
        const exercisePost = await this.prisma.exercisePost.findUnique({
          where: { id: exercisePostId }
        });

        if (!exercisePost) {
          throw new NotFoundException(`ExercisePost with ID ${exercisePostId} does not exist`);
        }
      }

      // Nếu exercisePostId là null, điều này có nghĩa là người dùng muốn xóa bài tập khỏi planSlot
      return await this.prisma.planSlot.update({
        where: { id },
        data: {
          ...rest,
          no: newNo?.toString(),
          exercisePostId: exercisePostId === null ? null : exercisePostId
        },
        include: {
          exercisePost: true
        }
      });
    } catch (error) {
      console.error('Update PlanSlot Error:', error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.planSlot.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Remove PlanSlot Error:', error);
      throw error;
    }
  }
} 