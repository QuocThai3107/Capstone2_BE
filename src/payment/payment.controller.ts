import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Logger, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorator/public.decorator';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async create(@Body() createPaymentDto: any) {
    try {
      this.logger.log('Received payment request:', createPaymentDto);
      const result = await this.paymentService.create(createPaymentDto);
      this.logger.log('Payment result:', result);
      return result;
    } catch (error) {
      this.logger.error('Payment error details:', error);
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
    this.logger.log('============= CALLBACK RECEIVED FROM ZALOPAY =============');
    this.logger.log('Callback data:', JSON.stringify(callbackData, null, 2));
    
    try {
      const result = await this.paymentService.handleCallback(callbackData);
      this.logger.log('Callback processing result:', result);
      return result;
    } catch (error) {
      this.logger.error('Callback error:', error);
      // Trả về đúng định dạng mà ZaloPay mong đợi để tránh retry
      return {
        return_code: -1,
        return_message: 'internal server error'
      };
    } finally {
      this.logger.log('============= END CALLBACK PROCESSING =============');
    }
  }

  @Get('check-status/:orderId')
  async checkPaymentStatus(@Param('orderId') orderId: string) {
    try {
      this.logger.log(`Checking payment status for order: ${orderId}`);
      
      // Tìm payment với HOẶC chính xác HOẶC contains
      const payment = await this.prisma.payment.findFirst({
        where: {
          OR: [
            { order_id: orderId },
            { order_id: { contains: orderId } },
            { order_id: { endsWith: orderId } }
          ]
        }
      });
      
      if (!payment) {
        this.logger.warn(`Payment not found for order: ${orderId}`);
        throw new HttpException('Không tìm thấy đơn hàng', HttpStatus.NOT_FOUND);
      }

      const statusText = this.getStatusText(payment.status_id);
      this.logger.log(`Found payment with order_id: ${payment.order_id}, status_id: ${payment.status_id}, status: ${statusText}`);

      const result = {
        payment_id: payment.payment_id,
        status_id: payment.status_id,
        status: statusText,
        status_description: this.getStatusDescription(payment.status_id),
        amount: payment.amount_paid,
        order_id: payment.order_id
      };
      
      this.logger.log(`Payment status result:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Error checking payment status for order ${orderId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Không thể kiểm tra trạng thái đơn hàng', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('my-payments/:userId')
  async getMyPayments(@Param('userId') userId: string) {
    try {
      this.logger.log(`Fetching payments for user: ${userId}`);
      const payments = await this.prisma.payment.findMany({
        where: {
          user_id: parseInt(userId)
        },
        orderBy: {
          payment_date: 'desc'
        }
      });

      return payments.map(payment => ({
        ...payment,
        status: this.getStatusText(payment.status_id),
        status_description: this.getStatusDescription(payment.status_id)
      }));
    } catch (error) {
      this.logger.error('Error fetching user payments:', error);
      throw new HttpException(
        {
          message: 'Không thể lấy lịch sử thanh toán',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  @Public()
  @Get('gym/:gymId')
  async getPaymentsByGym(@Param('gymId') gymId: string) {
    try {
      this.logger.log(`Fetching payments for gym owner with ID: ${gymId}`);
      
      // Lấy danh sách membership của gym owner
      const memberships = await this.prisma.membership.findMany({
        where: {
          user_id: parseInt(gymId)
        },
        select: {
          membership_id: true
        }
      });
      
      if (memberships.length === 0) {
        this.logger.log(`No memberships found for gym owner with ID: ${gymId}`);
        return {
          status: 'success',
          count: 0,
          data: []
        };
      }
      
      const membershipIds = memberships.map(m => m.membership_id);
      this.logger.log(`Found ${membershipIds.length} memberships for gym owner: ${membershipIds.join(', ')}`);
      
      // Lấy danh sách payment dựa trên membership_id
      const payments = await this.prisma.payment.findMany({
        where: {
          membership_id: {
            in: membershipIds
          }
        },
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              name: true,
              email: true,
              phoneNum: true,
              imgUrl: true
            }
          },
          membership: {
            select: {
              membership_id: true,
              membership_name: true,
              price: true,
              duration: true
            }
          }
        },
        orderBy: {
          payment_date: 'desc'
        }
      });
      
      return {
        status: 'success',
        count: payments.length,
        data: payments.map(payment => ({
          payment_id: payment.payment_id,
          user: payment.user,
          membership: payment.membership,
          amount_paid: payment.amount_paid,
          payment_date: payment.payment_date,
          status_id: payment.status_id,
          status: this.getStatusText(payment.status_id),
          status_description: this.getStatusDescription(payment.status_id),
          payment_method: payment.payment_method,
          order_id: payment.order_id
        }))
      };
    } catch (error) {
      this.logger.error('Error fetching gym payments:', error);
      throw new HttpException(
        {
          message: 'Không thể lấy danh sách thanh toán cho gym',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private getStatusText(statusId: number): string {
    switch (statusId) {
      case 0:
        return 'PENDING';
      case 1:
        return 'SUCCESS';
      case 2:
        return 'FAILED';
      default:
        return 'UNKNOWN';
    }
  }

  private getStatusDescription(statusId: number): string {
    switch (statusId) {
      case 0:
        return 'Đang chờ thanh toán';
      case 1:
        return 'Thanh toán thành công';
      case 2:
        return 'Thanh toán thất bại';
      default:
        return 'Trạng thái không xác định';
    }
  }
} 