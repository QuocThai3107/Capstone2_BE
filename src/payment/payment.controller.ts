import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async create(@Body() createPaymentDto: any) {
    try {
      console.log('Received payment request:', createPaymentDto);
      const result = await this.paymentService.create(createPaymentDto);
      console.log('Payment result:', result);
      return result;
    } catch (error) {
      console.error('Payment error details:', error);
      throw new HttpException(
        {
          message: 'Không thể tạo thanh toán',
          error: error.message
        },
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

  @Get('check-status/:orderId')
  async checkPaymentStatus(@Param('orderId') orderId: string) {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { order_id: orderId }
      });
      
      if (!payment) {
        throw new HttpException(
          'Không tìm thấy đơn hàng',
          HttpStatus.NOT_FOUND
        );
      }

      return {
        payment_id: payment.payment_id,
        status_id: payment.status_id,
        amount: payment.amount_paid,
        order_id: payment.order_id
      };
    } catch (error) {
      throw new HttpException(
        'Không thể kiểm tra trạng thái đơn hàng',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 