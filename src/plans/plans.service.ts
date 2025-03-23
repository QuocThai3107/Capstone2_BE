import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    return await this.prisma.plan.create({
      data: createPlanDto,
      include: {
        planSlots: true
      }
    });
  }

  async findAll(userId: number) {
    return await this.prisma.plan.findMany({
      where: {
        user_id: userId
      },
      include: {
        planSlots: true
      }
    });
  }

  async findOne(id: number) {
    return await this.prisma.plan.findUnique({
      where: { plan_id: id },
      include: {
        planSlots: true
      }
    });
  }

  async update(id: number, updatePlanDto: UpdatePlanDto) {
    return await this.prisma.plan.update({
      where: { plan_id: id },
      data: updatePlanDto,
      include: {
        planSlots: true
      }
    });
  }

  async remove(id: number) {
    await this.prisma.planSlot.deleteMany({
      where: {
        planId: id,
      },
    });

    return await this.prisma.plan.delete({
      where: {
        plan_id: id,
      },
    });
  }
} 