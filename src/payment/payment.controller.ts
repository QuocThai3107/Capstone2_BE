import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @GetUser('user_id') userId: number,
    @Body() createPaymentDto: any
  ) {
    try {
      createPaymentDto.user_id = userId;

      return await this.paymentService.create(createPaymentDto);
    } catch (error) {
      throw new HttpException(
        'Không thể tạo thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  async checkStatus(
    @GetUser('user_id') userId: number,
    @Param('orderId') orderId: string
  ) {
    try {
      return await this.paymentService.checkPaymentStatus(orderId, userId);
    } catch (error) {
      throw new HttpException(
        'Không thể kiểm tra trạng thái thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('callback')
  async handleCallback(@Body() callbackData: any) {
    try {
      return await this.paymentService.handleCallback(callbackData);
    } catch (error) {
      console.error('Callback error:', error);
      return {
        return_code: -1,
        return_message: 'internal server error'
      };
    }
  }
} 