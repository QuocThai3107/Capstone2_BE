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
        where: { plan_id: planId }
      });
      
      if (!plan) {
        throw new NotFoundException(`Plan with ID ${planId} does not exist`);
      }

      // Kiểm tra exercisePostId nếu được cung cấp
      if (exercisePostId) {
        const exercisePost = await this.prisma.exercisepost.findUnique({
          where: { exercisepost_id: exercisePostId }
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
          planId: planId,
          no: no.toString(),
          note,
          duration
        },
        include: {
          plan: true
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
        where: { planId: planId },
        orderBy: {
          no: 'asc'
        },
        include: {
          plan: true
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
        where: { 
          planId_no: {
            planId: id,
            no: id.toString()
          }
        },
        include: {
          plan: true
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
        const exercisePost = await this.prisma.exercisepost.findUnique({
          where: { exercisepost_id: exercisePostId }
        });

        if (!exercisePost) {
          throw new NotFoundException(`ExercisePost with ID ${exercisePostId} does not exist`);
        }
      }

      // Nếu exercisePostId là null, điều này có nghĩa là người dùng muốn xóa bài tập khỏi planSlot
      return await this.prisma.planSlot.update({
        where: { 
          planId_no: {
            planId: id,
            no: id.toString()
          }
        },
        data: {
          ...rest,
          no: newNo?.toString(),
          duration: updateData.duration,
          note: updateData.note
        },
        include: {
          plan: true
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
        where: { 
          planId_no: {
            planId: id,
            no: id.toString()
          }
        }
      });
    } catch (error) {
      console.error('Remove PlanSlot Error:', error);
      throw error;
    }
  }
} 