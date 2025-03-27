import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePTDto } from './dto/create-pt.dto';

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
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.JWT_SECRET_KEY,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET_KEY,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        // Không lưu refreshToken trong database vì không có trường tương ứng
        // Có thể sử dụng giải pháp khác như Redis
      }
    });
  }

  async registerPT(createPTDto: CreatePTDto, certificates: Array<Express.Multer.File>) {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.prisma.user.findFirst({
      where: { username: createPTDto.username }
    });

    if (existingUser) {
      throw new BadRequestException('Username đã tồn tại');
    }

    // Kiểm tra role_id
    if (createPTDto.role_id !== 3) {
      throw new BadRequestException('role_id phải là 3 cho PT');
    }

    let uploadResults = [];
    try {
      // Upload tất cả certificates lên Cloudinary
      uploadResults = await Promise.all(
        certificates.map(file => this.cloudinary.uploadImage(file))
      );

      // Hash password
      const hashedPassword = await bcrypt.hash(createPTDto.password, 10);

      // Tạo user và certificates trong cùng một transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Tạo user mới với role_id = 3
        const newUser = await prisma.user.create({
          data: {
            username: createPTDto.username,
            password: hashedPassword,
            role_id: 3, // Đảm bảo role_id là 3
            gym: createPTDto.gym,
          },
        });

        // Tạo các certificate
        // await prisma.certificate.createMany({
        //   data: createPTDto.certificates.map((cert) => ({
        //     user_id: user.user_id,
        //     ...cert,
        //   })),
        // });

        return newUser;
      });

      // Tạo tokens
      const tokens = await this.getTokens(result.user_id, result.username);
      await this.updateRefreshToken(result.user_id, tokens.refreshToken);

      return {
        message: 'Đăng ký PT thành công',
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };

    } catch (error) {
      // Nếu có lỗi, xóa các ảnh đã upload trên Cloudinary
      if (uploadResults.length > 0) {
        await Promise.all(
          uploadResults.map(result => 
            this.cloudinary.deleteImage(result.public_id)
          )
        );
      }
      throw error;
    }
  }
} 