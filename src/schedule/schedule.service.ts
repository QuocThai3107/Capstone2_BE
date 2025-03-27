import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    try {
      // Kiểm tra plan có tồn tại không
      const plan = await this.prisma.plan.findUnique({
        where: { plan_id: createScheduleDto.plan_id }
      });

      if (!plan) {
        throw new NotFoundException('Không tìm thấy plan');
      }

      const schedule = await this.prisma.schedule.create({
        data: createScheduleDto,
        include: {
          plan: true
        }
      });

      return {
        status: 'success',
        data: schedule
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(userId: number) {
    try {
      const schedules = await this.prisma.schedule.findMany({
        where: {
          user_id: userId
        },
        include: {
          plan: true
        }
      });

      return {
        status: 'success',
        data: schedules
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const schedule = await this.prisma.schedule.findUnique({
        where: { schedule_id: id },
        include: {
          plan: true
        }
      });

      if (!schedule) {
        throw new NotFoundException('Không tìm thấy lịch tập');
      }

      return {
        status: 'success',
        data: schedule
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    try {
      const schedule = await this.prisma.schedule.findUnique({
        where: { schedule_id: id }
      });

      if (!schedule) {
        throw new NotFoundException('Không tìm thấy lịch tập');
      }

      const updatedSchedule = await this.prisma.schedule.update({
        where: { schedule_id: id },
        data: updateScheduleDto,
        include: {
          plan: true
        }
      });

      return {
        status: 'success',
        data: updatedSchedule
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const schedule = await this.prisma.schedule.findUnique({
        where: { schedule_id: id }
      });

      if (!schedule) {
        throw new NotFoundException('Không tìm thấy lịch tập');
      }

      await this.prisma.schedule.delete({
        where: { schedule_id: id }
      });

      return {
        status: 'success',
        message: 'Đã xóa lịch tập thành công'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
} 