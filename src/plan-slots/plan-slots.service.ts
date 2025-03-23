import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanSlotDto } from './dto/create-plan-slot.dto';
import { UpdatePlanSlotDto } from './dto/update-plan-slot.dto';

@Injectable()
export class PlanSlotsService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanSlotDto: CreatePlanSlotDto) {
    try {
      const { plan_id, no, note, duration } = createPlanSlotDto;

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
          id: Math.floor(Math.random() * 1000000),
          planId: plan_id,
          no,
          note,
          duration,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(plan_id: number) {
    try {
      return await this.prisma.planSlot.findMany({
        where: {
          planId: plan_id,
        },
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

  async findOne(plan_id: number, no: string) {
    try {
      return await this.prisma.planSlot.findUnique({
        where: {
          planId_no: {
            planId: plan_id,
            no,
          },
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

  async update(plan_id: number, no: string, updateData: UpdatePlanSlotDto) {
    try {
      const { note, duration } = updateData;

      return await this.prisma.planSlot.update({
        where: {
          planId_no: {
            planId: plan_id,
            no,
          },
        },
        data: {
          note,
          duration,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(plan_id: number, no: string) {
    try {
      return await this.prisma.planSlot.delete({
        where: {
          planId_no: {
            planId: plan_id,
            no,
          },
        }
      });
    } catch (error) {
      console.error('Remove PlanSlot Error:', error);
      throw error;
    }
  }
} 