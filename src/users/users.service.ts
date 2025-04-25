import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { MulterFile } from '../interfaces/file.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        name: createUserDto.name,
        role_id: createUserDto.role_id,
        email: createUserDto.email,
        phoneNum: createUserDto.phoneNum,
        Status_id: createUserDto.Status_id
      },
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        role_id: true,
        Status_id: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        role_id: true,
        Status_id: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { user_id: id },
    });
  }

  findOneWithAll(id: number) {
    return this.prisma.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        role_id: true,
        Status_id: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        gym: true,
        created_at: true,
        updated_at: true,
      }
    });
  }

  async updateProfile(id: number, updateUserDto: UpdateUserDto, file?: MulterFile) {
    try {
      console.log('=== Bắt đầu cập nhật profile ===');
      console.log('ID người dùng:', id);
      console.log('Dữ liệu nhận được:', JSON.stringify(updateUserDto, null, 2));

      const existingUser = await this.prisma.user.findUnique({
        where: { user_id: id },
        select: {
          user_id: true,
          username: true,
          name: true,
          email: true,
          phoneNum: true,
          role_id: true,
          Status_id: true,
          imgUrl: true,
          introduction: true,
          Health_information: true,
          illness: true,
        }
      });

      if (!existingUser) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      console.log('Thông tin người dùng hiện tại:', JSON.stringify(existingUser, null, 2));

      const updateData: any = {};

      // Xử lý các trường cập nhật
      if ('name' in updateUserDto) {
        updateData.name = updateUserDto.name?.trim() || null;
        console.log('Cập nhật tên:', updateData.name);
      }

      if ('email' in updateUserDto) {
        updateData.email = updateUserDto.email?.trim() || null;
        console.log('Cập nhật email:', updateData.email);
      }

      // Xử lý số điện thoại
      if ('phoneNum' in updateUserDto) {
        console.log('Xử lý số điện thoại:', updateUserDto.phoneNum);
        
        if (!updateUserDto.phoneNum || updateUserDto.phoneNum.trim() === '') {
          console.log('Số điện thoại rỗng -> null');
          updateData.phoneNum = null;
        } else {
          const phoneNum = updateUserDto.phoneNum.trim();
          console.log('Số điện thoại sau khi trim:', phoneNum);
          
          if (!/^\d{10}$/.test(phoneNum)) {
            throw new Error('Số điện thoại phải có đúng 10 chữ số');
          }
          
          updateData.phoneNum = phoneNum;
          console.log('Số điện thoại hợp lệ, sẽ cập nhật:', updateData.phoneNum);
        }
      }

      if ('introduction' in updateUserDto) {
        updateData.introduction = updateUserDto.introduction?.trim() || null;
        console.log('Cập nhật giới thiệu:', updateData.introduction);
      }

      if ('Health_information' in updateUserDto) {
        updateData.Health_information = updateUserDto.Health_information?.trim() || null;
        console.log('Cập nhật thông tin sức khỏe:', updateData.Health_information);
      }

      if ('illness' in updateUserDto) {
        updateData.illness = updateUserDto.illness?.trim() || null;
        console.log('Cập nhật thông tin bệnh lý:', updateData.illness);
      }

      // Xử lý file ảnh
      if (file) {
        if (existingUser.imgUrl) {
          const publicId = existingUser.imgUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        }
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        updateData.imgUrl = uploadResult.url;
        console.log('Cập nhật ảnh:', updateData.imgUrl);
      }

      console.log('=== Dữ liệu sẽ cập nhật ===');
      console.log(JSON.stringify(updateData, null, 2));

      const updatedUser = await this.prisma.user.update({
        where: { user_id: id },
        data: updateData,
        select: {
          user_id: true,
          username: true,
          name: true,
          email: true,
          phoneNum: true,
          role_id: true,
          Status_id: true,
          imgUrl: true,
          introduction: true,
          Health_information: true,
          illness: true,
          created_at: true,
          updated_at: true,
        },
      });

      console.log('=== Kết quả cập nhật ===');
      console.log(JSON.stringify(updatedUser, null, 2));

      return updatedUser;
    } catch (error) {
      console.error('=== Lỗi cập nhật ===');
      console.error('Chi tiết:', error);
      throw error;
    }
  }

  async updateAdmin(id: number, updateUserAdminDto: UpdateUserAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const data: any = { ...updateUserAdminDto };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { user_id: id },
      data: {
        username: data.username,
        password: data.password,
        role_id: data.role_id,
        Status_id: data.Status_id,
      },
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        role_id: true,
        Status_id: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { user_id: id },
    });
  }

  async getPublicProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getPTDetail(id: number) {
    try {
      const ptDetail = await this.prisma.user.findUnique({
        where: {
          user_id: id,
          role_id: 2, // Role PT
        },
        select: {
          user_id: true,
          username: true,
          email: true,
          phoneNum: true,
          name: true,
          imgUrl: true,
          introduction: true,
          gym: true,
          // certificate đã bị đánh dấu @@ignore trong schema.prisma nên không thể sử dụng
          // certificate: {
          //   select: {
          //     imgurl: true
          //   }
          // }
        }
      });

      if (!ptDetail) {
        throw new NotFoundException('Không tìm thấy PT với ID này');
      }

      return {
        status: 'success',
        data: ptDetail
      };
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi lấy thông tin PT');
    }
  }

  async getProfile(userId: number) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { 
        user_id: userId 
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        phoneNum: true,
        role_id: true,
        name: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true
      }
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return {
      status: 'success',
      data: user
    };
  }

  async getPTProfile(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { 
        user_id: userId,
        role_id: 3, // Role PT
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        phoneNum: true,
        role_id: true,
        name: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        gym: true,
        certificate: {
          select: {
            imgurl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin PT');
    }

    return {
      status: 'success',
      data: user,
    };
  }

  async getGymUsers() {
    return await this.prisma.user.findMany({
      where: {
        role_id: 4
      },
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        role_id: true,
        Status_id: true,
        imgUrl: true,
        introduction: true,
        Health_information: true,
        illness: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  async getPTsByGym() {
    // Lấy danh sách tên gym từ các Gym Owner (role_id = 4)
    const gymOwners = await this.prisma.user.findMany({
      where: {
        role_id: 4
      },
      select: {
        name: true
      }
    });

    const gymNames = gymOwners.map(owner => owner.name);

    // Lấy danh sách PT (role_id = 3, Status_id = 1) thuộc các gym đó
    const pts = await this.prisma.user.findMany({
      where: {
        role_id: 3,
        Status_id: 1,
        gym: {
          in: gymNames
        }
      },
      select: {
        user_id: true,
        username: true,
        name: true,
        email: true,
        phoneNum: true,
        gym: true,
        Status_id: true,
        certificate: true
      }
    });

    return pts.map(pt => ({
      id: pt.user_id,
      username: pt.username,
      name: pt.name,
      email: pt.email,
      phoneNum: pt.phoneNum,
      gym: pt.gym,
      Status_id: pt.Status_id,
      certificate: pt.certificate || []
    }));
  }

  async getPendingPTs() {
    try {
      // Lấy danh sách tên gym từ các Gym Owner (role_id = 4)
      const gymOwners = await this.prisma.user.findMany({
        where: {
          role_id: 4
        },
        select: {
          name: true
        }
      });

      const gymNames = gymOwners.map(owner => owner.name);

      // Lấy danh sách PT (role_id = 3, Status_id = 1) thuộc các gym đó
      const pts = await this.prisma.user.findMany({
        where: {
          role_id: 3,
          Status_id: 1,
          gym: {
            in: gymNames
          }
        },
        select: {
          user_id: true,
          username: true,
          name: true,
          email: true,
          phoneNum: true,
          gym: true,
          Status_id: true,
          certificate: true
        }
      });

      return pts.map(pt => ({
        id: pt.user_id,
        username: pt.username,
        name: pt.name,
        email: pt.email,
        phoneNum: pt.phoneNum,
        gym: pt.gym,
        Status_id: pt.Status_id,
        certificate: pt.certificate || []
      }));
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách PT chờ duyệt');
    }
  }

  async approvePT(id: number) {
    try {
      const pt = await this.prisma.user.findFirst({
        where: {
          AND: [
            { user_id: id },
            { role_id: 3 },
            { Status_id: 1 }
          ]
        }
      });

      if (!pt) {
        throw new NotFoundException('PT không tồn tại hoặc không ở trạng thái chờ duyệt');
      }

      const updatedPT = await this.prisma.user.update({
        where: { user_id: id },
        data: {
          Status_id: 2, // Active
          updated_at: new Date()
        },
        select: {
          user_id: true,
          username: true,
          name: true,
          email: true,
          phoneNum: true,
          role_id: true,
          Status_id: true,
          gym: true,
          updated_at: true
        }
      });

      return updatedPT;
    } catch (error) {
      throw error;
    }
  }

  async rejectPT(id: number) {
    try {
      const pt = await this.prisma.user.findFirst({
        where: {
          AND: [
            { user_id: id },
            { role_id: 3 },
            { Status_id: 1 }
          ]
        }
      });

      if (!pt) {
        throw new NotFoundException('PT không tồn tại hoặc không ở trạng thái chờ duyệt');
      }

      const deletedPT = await this.prisma.user.delete({
        where: { user_id: id },
        select: {
          user_id: true,
          username: true,
          name: true,
          email: true,
          phoneNum: true,
          role_id: true,
          Status_id: true,
          gym: true
        }
      });

      return deletedPT;
    } catch (error) {
      throw error;
    }
  }

<<<<<<< Updated upstream
  async getAllPTs() {
    try {
      const pts = await this.prisma.user.findMany({
        where: {
          role_id: 3
        },
        select: {
          user_id: true,
          username: true,
          name: true,
          email: true,
          phoneNum: true,
          imgUrl: true,
          introduction: true,
          gym: true,
          Status_id: true
        }
      });

      return {
        status: 'success',
        data: pts
      };
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách PT');
    }
=======
  // Add missing methods
  async getPTs() {
    return this.prisma.user.findMany({
      where: {
        role_id: 3 // PT role
      }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { user_id: id },
      data: updateUserDto
    });
>>>>>>> Stashed changes
  }
} 