import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(
    @GetUser('user_id') userId: number,
    @Body() createPaymentDto: CreatePaymentDto
  ) {
    createPaymentDto.user_id = userId;
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Post('callback')
  async handleCallback(@Body() callbackData: any) {
    return this.paymentService.handleCallback(callbackData);
  }

  @Get('status/:orderId')
  async checkPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.checkPaymentStatus(orderId);
  }
} 