import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: {
        plan_name: createPlanDto.plan_name,
        Description: createPlanDto.Description,
        total_duration: createPlanDto.total_duration,
        user_id: createPlanDto.user_id
      },
      include: {
        planslot: true
      }
    });
  }

  async findAll(userId: number) {
    return this.prisma.plan.findMany({
      where: {
        user_id: Number(userId)
      },
      include: {
        planslot: true
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.plan.findUnique({
      where: { plan_id: id },
      include: {
        planslot: true
      }
    });
  }

  async update(id: number, updateData: Partial<CreatePlanDto>) {
    return this.prisma.plan.update({
      where: { plan_id: id },
      data: {
        plan_name: updateData.plan_name,
        Description: updateData.Description,
        total_duration: updateData.total_duration,
        user_id: updateData.user_id
      },
      include: {
        planslot: true
      }
    });
  }

  async remove(id: number) {
    // Xóa tất cả plan slots trước
    await this.prisma.planslot.deleteMany({
      where: { plan_id: id }
    });

    // Sau đó xóa plan
    return this.prisma.plan.delete({
      where: { plan_id: id }
    });
  }
} 