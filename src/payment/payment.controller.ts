import { Controller, Post, Body, Get, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      return await this.paymentService.create(createPaymentDto);
    } catch (error) {
      throw new HttpException({
        statusCode: 500,
        message: 'Không thể tạo thanh toán',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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