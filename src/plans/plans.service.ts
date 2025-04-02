import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreatePlanSlotDto } from '../plan-slots/dto/create-plan-slot.dto';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(createPlanDto: CreatePlanDto) {
    try {
      const { user_id, plan_name, Description, total_duration, planSlots } = createPlanDto;

      // Tạo plan mới
      const newPlan = await this.prisma.plan.create({
        data: {
          user_id,
          plan_name,
          Description,
          total_duration,
        },
      });

      // Nếu có planSlots, tạo các slot cho plan
      if (planSlots && planSlots.length > 0) {
        for (const slot of planSlots) {
          await this.prisma.planSlot.create({
            data: {
              planId: newPlan.plan_id,
              no: slot.no,
              note: slot.note,
              duration: slot.duration,
            },
          });
        }
      }

      // Trả về plan với slots đã tạo
      return this.findOne(newPlan.plan_id);
    } catch (error) {
      console.error('Create Plan Error:', error);
      throw error;
    }
  }

  async findAll(userId?: number) {
    try {
      // Debug thêm
      console.log('Service received userId:', userId, 'Type:', typeof userId);
      
      // Nếu không có userId, trả về tất cả plans
      if (userId === undefined || userId === null) {
        console.log('No userId provided, returning all plans');
        return await this.prisma.plan.findMany({
          include: {
            user: true,
            planSlots: true
          },
          orderBy: {
            created_at: 'desc'
          }
        });
      }
      
      // Đảm bảo userId là số integer
      const userIdNumber = Number(userId);
      console.log('Using userId as number:', userIdNumber, 'Type:', typeof userIdNumber);
      
      // Tìm tất cả plan của user
      const plans = await this.prisma.plan.findMany({
        where: {
          user_id: userIdNumber
        },
        include: {
          user: true,
          planSlots: {
            orderBy: {
              no: 'asc'
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      console.log(`Found ${plans.length} plans for user ${userIdNumber}`);
      return plans;
    } catch (error) {
      console.error('FindAll Plans Error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async findOne(plan_id: number) {
    try {
      const plan = await this.prisma.plan.findUnique({
        where: {
          plan_id,
        },
        include: {
          user: true,
          planSlots: {
            orderBy: {
              no: 'asc',
            },
          },
        },
      });

      if (!plan) {
        throw new NotFoundException(`Plan với ID ${plan_id} không tồn tại`);
      }

      return plan;
    } catch (error) {
      console.error('FindOne Plan Error:', error);
      throw error;
    }
  }

  async update(plan_id: number, updatePlanDto: UpdatePlanDto) {
    try {
      const { plan_name, Description, total_duration } = updatePlanDto;

      // Kiểm tra xem plan có tồn tại không
      const existingPlan = await this.prisma.plan.findUnique({
        where: {
          plan_id,
        },
      });

      if (!existingPlan) {
        throw new NotFoundException(`Plan với ID ${plan_id} không tồn tại`);
      }

      // Cập nhật plan
      const updatedPlan = await this.prisma.plan.update({
        where: {
          plan_id,
        },
        data: {
          plan_name,
          Description, 
          total_duration,
        },
      });

      return updatedPlan;
    } catch (error) {
      console.error('Update Plan Error:', error);
      throw error;
    }
  }

  async remove(plan_id: number) {
    try {
      // Kiểm tra xem plan có tồn tại không
      const existingPlan = await this.prisma.plan.findUnique({
        where: {
          plan_id,
        },
      });

      if (!existingPlan) {
        throw new NotFoundException(`Plan với ID ${plan_id} không tồn tại`);
      }

      // Xóa tất cả các slot liên quan trước
      await this.prisma.planSlot.deleteMany({
        where: {
          planId: plan_id,
        },
      });

      // Xóa plan
      const deletedPlan = await this.prisma.plan.delete({
        where: {
          plan_id,
        },
      });

      return deletedPlan;
    } catch (error) {
      console.error('Remove Plan Error:', error);
      throw error;
    }
  }
}