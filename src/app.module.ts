import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { PlanSlotsModule } from './plan-slots/plan-slots.module';
import { ExercisePostModule } from './exercise-post/exercise-post.module';
import { ExercisePostTagModule } from './exercise-post-tag/exercise-post-tag.module';
import { StepModule } from './step/step.module';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ScheduleModule } from './schedule/schedule.module';
import { MembershipModule } from './membership/membership.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    PlansModule,
    PlanSlotsModule,
    ExercisePostModule,
    ExercisePostTagModule,
    StepModule,
    AuthModule,
    ChatModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ScheduleModule,
    MembershipModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}