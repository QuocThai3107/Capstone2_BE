import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { RoleGuard } from './guards/role.guard';

const JWT_SECRET = 'Capstone2BE_2024!@#SECURE_JWT_KEY_987654321';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RoleGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {} 