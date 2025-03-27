import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanSlotDto } from './dto/create-plan-slot.dto';
import { UpdatePlanSlotDto } from './dto/update-plan-slot.dto';

@Injectable()
export class PlanSlotsService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanSlotDto: CreatePlanSlotDto) {
    try {
      const { plan_id, no, note, duration, exercisePostId } = createPlanSlotDto;

      const lastPlanSlot = await this.prisma.planSlot.findFirst({
        where: {
          planId: plan_id,
        },
        orderBy: {
          no: 'desc',
        },
      });

      return await this.prisma.planSlot.create({
        data: {
          planId: plan_id,
          no,
          note,
          duration,
          exercisePostId,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(plan_id?: number) {
    try {
      // Nếu không có plan_id, trả về tất cả plan slots
      if (plan_id === undefined || plan_id === null) {
        return await this.prisma.planSlot.findMany({
          orderBy: { no: 'asc' },
          include: {
            plan: true,
            exercisepost: true
          }
        });
      }
      
      // Chuyển đổi plan_id thành số nguyên
      const planIdNumber = Number(plan_id);
      
      return await this.prisma.planSlot.findMany({
        where: {
          planId: planIdNumber
        },
        orderBy: {
          no: 'asc'
        },
        include: {
          plan: true,
          exercisepost: true
        }
      });
    } catch (error) {
      console.error('FindAll PlanSlot Error:', error);
      throw error;
    }
  }

  async findOne(plan_id: number, no: string) {
    try {
      return await this.prisma.planSlot.findFirst({
        where: {
          planId: plan_id,
          no: no,
        },
        include: {
          plan: true,
          exercisepost: true
        }
      });
    } catch (error) {
      console.error('FindOne PlanSlot Error:', error);
      throw error;
    }
  }

  async update(plan_id: number, no: string, updateData: UpdatePlanSlotDto) {
    try {
      const { note, duration, exercisePostId } = updateData;

      return await this.prisma.planSlot.updateMany({
        where: {
          planId: plan_id,
          no: no,
        },
        data: {
          note,
          duration,
          exercisePostId,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(plan_id: number, no: string) {
    try {
      return await this.prisma.planSlot.deleteMany({
        where: {
          planId: plan_id,
          no: no,
        }
      });
    } catch (error) {
      console.error('Remove PlanSlot Error:', error);
      throw error;
    }
  }
}