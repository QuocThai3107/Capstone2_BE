import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async create(createMembershipDto: CreateMembershipDto) {
    try {
      const membership = await this.prisma.membership.create({
        data: {
          ...createMembershipDto,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        status: 'success',
        data: membership,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const memberships = await this.prisma.membership.findMany({
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        status: 'success',
        data: memberships,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const membership = await this.prisma.membership.findUnique({
        where: { membership_id: id },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });

      if (!membership) {
        throw new NotFoundException('Không tìm thấy membership');
      }

      return {
        status: 'success',
        data: membership,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateMembershipDto: UpdateMembershipDto) {
    try {
      const membership = await this.prisma.membership.findUnique({
        where: { membership_id: id },
      });

      if (!membership) {
        throw new NotFoundException('Không tìm thấy membership');
      }

      const updatedMembership = await this.prisma.membership.update({
        where: { membership_id: id },
        data: {
          ...updateMembershipDto,
          updated_at: new Date(),
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        status: 'success',
        data: updatedMembership,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const membership = await this.prisma.membership.findUnique({
        where: { membership_id: id },
      });

      if (!membership) {
        throw new NotFoundException('Không tìm thấy membership');
      }

      await this.prisma.membership.delete({
        where: { membership_id: id },
      });

      return {
        status: 'success',
        message: 'Xóa membership thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  // Thêm method để lấy membership theo user_id
  async findByUserId(userId: number) {
    try {
      const memberships = await this.prisma.membership.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        status: 'success',
        data: memberships,
      };
    } catch (error) {
      throw error;
    }
  }
} 