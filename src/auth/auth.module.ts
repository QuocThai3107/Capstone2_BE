import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleGuard } from './guards/role.guard';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: 'Capstone2BE_2024!@#SECURE_JWT_KEY_987654321',
      signOptions: { 
        expiresIn: '1d',
        algorithm: 'HS256'
      },
    }),
    CloudinaryModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RoleGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {} 