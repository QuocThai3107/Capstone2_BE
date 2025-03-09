import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: createPlanDto,
      include: {
        planSlots: true
      }
    });
  }

  async findAll(userId: number) {
    return this.prisma.plan.findMany({
      where: {
        userId: Number(userId)
      },
      include: {
        planSlots: true
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.plan.findUnique({
      where: { id },
      include: {
        planSlots: true
      }
    });
  }

  async update(id: number, updateData: Partial<CreatePlanDto>) {
    return this.prisma.plan.update({
      where: { id },
      data: updateData,
      include: {
        planSlots: true
      }
    });
  }

  async remove(id: number) {
    // Xóa tất cả plan slots trước
    await this.prisma.planSlot.deleteMany({
      where: { planId: id }
    });

    // Sau đó xóa plan
    return this.prisma.plan.delete({
      where: { id }
    });
  }
} 