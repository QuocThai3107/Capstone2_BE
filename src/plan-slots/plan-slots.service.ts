import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanSlotDto } from './dto/create-plan-slot.dto';

@Injectable()
export class PlanSlotsService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanSlotDto: CreatePlanSlotDto) {
    try {
      const { planId, no, note, duration } = createPlanSlotDto;
      
      // Kiểm tra xem planId có tồn tại không
      const plan = await this.prisma.plan.findUnique({
        where: { id: planId }
      });
      
      if (!plan) {
        throw new Error(`Plan with ID ${planId} does not exist`);
      }

      return await this.prisma.planSlot.create({
        data: {
          planId,
          no: no.toString(),
          note,
          duration
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
        where: { id }
      });
    } catch (error) {
      console.error('FindOne PlanSlot Error:', error);
      throw error;
    }
  }

  async update(id: number, updateData: Partial<CreatePlanSlotDto>) {
    try {
      const { no: newNo, ...rest } = updateData;
      return await this.prisma.planSlot.update({
        where: { id },
        data: {
          ...rest,
          no: newNo?.toString()
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