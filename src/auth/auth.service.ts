import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePTDto } from './dto/create-pt.dto';
import { ApprovePTDto } from './dto/approve-pt.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cloudinary: CloudinaryService
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username: createUserDto.username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Tạo user mới
    const newUser = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        email: createUserDto.email,
        phoneNum: createUserDto.phoneNum,
        name: createUserDto.name,
        role_id: createUserDto.role_id,
        Status_id: createUserDto.Status_id,
      },
    });

    // Tạo token
    const payload = { 
      user_id: newUser.user_id, 
      username: newUser.username,
      role_id: newUser.role_id 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id,
        name: newUser.name,
        imgUrl: newUser.imgUrl,
      }
    };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    // Kiểm tra tham số đầu vào
    if (!username || !pass) {
      throw new UnauthorizedException('Username và password là bắt buộc');
    }

    const user = await this.prisma.user.findFirst({
      where: { username }
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    // Kiểm tra password có tồn tại trong database không
    if (!user.password) {
      throw new UnauthorizedException('Lỗi xác thực');
    }

    try {
      const isMatch = await bcrypt.compare(pass, user.password);
      
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu không đúng');
      }

      // Loại bỏ password trước khi trả về
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw new UnauthorizedException('Lỗi xác thực');
    }
  }

  async login(loginDto: { username: string; password: string }) {
    try {
      // Kiểm tra đầu vào
      if (!loginDto?.username || !loginDto?.password) {
        throw new UnauthorizedException('Username và password là bắt buộc');
      }

      // Tìm user
      const user = await this.prisma.user.findFirst({
        where: { username: loginDto.username }
      });

      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }

      // Kiểm tra password
      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu không đúng');
      }

      // Tạo token
      const payload = {
        user_id: user.user_id,
        username: user.username,
        role_id: user.role_id
      };

      // Trả về token và thông tin user
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role_id: user.role_id,
          name: user.name,
          imgUrl: user.imgUrl
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUserRole(user_id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id: user_id,
      },
      select: {
        user_id: true,
        username: true,
        role_id: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }

    return user;
  }

  async getTokens(userId: number, username: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        username,
      },
      {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: '15m',
      },
    );

    return {
      accessToken,
    };
  }

  async registerPT(createPTDto: CreatePTDto, files: Express.Multer.File[]) {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username: createPTDto.username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username đã tồn tại');
    }

    // Kiểm tra gym nếu có
    if (createPTDto.gym) {
      const gym = await this.prisma.user.findFirst({
        where: {
          username: createPTDto.gym,
          role_id: 4 // Gym owner role
        },
      });

      if (!gym) {
        throw new BadRequestException('Gym không tồn tại');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createPTDto.password, 10);

    // Upload certificates to Cloudinary
    const certificateUrls = await Promise.all(
      files.map(async (file) => {
        const result = await this.cloudinary.uploadImage(file);
        return result.url;
      })
    );

    // Tạo user mới
    const newUser = await this.prisma.user.create({
      data: {
        username: createPTDto.username,
        password: hashedPassword,
        email: createPTDto.email,
        phoneNum: createPTDto.phoneNum,
        name: createPTDto.name,
        role_id: createPTDto.role_id,
        Status_id: createPTDto.Status_id,
        gym: createPTDto.gym,
        certificate: {
          create: certificateUrls.map(url => ({
            imgurl: url
          }))
        }
      },
      include: {
        certificate: true
      }
    });

    // Tạo token
    const payload = { 
      user_id: newUser.user_id, 
      username: newUser.username,
      role_id: newUser.role_id 
    };

    return {
      message: 'Đăng ký thành công',
      access_token: this.jwtService.sign(payload),
      user: newUser
    };
  }

  async approvePT(approvePTDto: ApprovePTDto, approverId: number) {
    try {
      // Kiểm tra người duyệt có quyền không
      const approver = await this.prisma.user.findUnique({
        where: { user_id: approverId },
        select: { role_id: true, username: true }
      });

      if (!approver) {
        throw new ForbiddenException('Không tìm thấy thông tin người duyệt');
      }

      // Kiểm tra PT cần duyệt
      const pt = await this.prisma.user.findUnique({
        where: { user_id: approvePTDto.user_id },
        select: { 
          role_id: true, 
          Status_id: true,
          gym: true
        }
      });

      if (!pt) {
        throw new BadRequestException('PT không tồn tại');
      }

      if (pt.role_id !== 3) {
        throw new BadRequestException('User này không phải là PT');
      }

      // Kiểm tra quyền duyệt
      if (approver.role_id === 4) { // Nếu là gym owner
        if (!pt.gym || pt.gym !== approver.username) {
          throw new ForbiddenException('Bạn không có quyền duyệt PT này');
        }
      } else if (approver.role_id !== 1) { // Nếu không phải admin
        throw new ForbiddenException('Bạn không có quyền duyệt PT');
      }

      // Cập nhật trạng thái của PT
      const updatedPT = await this.prisma.user.update({
        where: { user_id: approvePTDto.user_id },
        data: {
          Status_id: approvePTDto.Status_id,
        },
        select: {
          user_id: true,
          username: true,
          name: true,
          Status_id: true,
          role_id: true,
          gym: true,
          certificate: true
        }
      });

      return {
        message: approvePTDto.Status_id === 2 ? 'Duyệt PT thành công' : 'Từ chối PT thành công',
        data: updatedPT
      };
    } catch (error) {
      console.error('Approve PT error:', error);
      throw error;
    }
  }

  async getGyms() {
    const gyms = await this.prisma.user.findMany({
      where: {
        role_id: 4 // Gym owner role
      },
      select: {
        user_id: true,
        username: true,
        name: true,
        Status_id: true // Thêm Status_id để FE biết trạng thái duyệt
      }
    });
    return gyms;
  }
} 