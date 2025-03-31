import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import * as moment from 'moment';

// Cấu hình ngrok URL cho callback
const NGROK_URL = 'https://2671-117-2-155-20.ngrok-free.app';

// Thêm config ZaloPay với URL ngrok
const ZALOPAY_CONFIG = {
  app_id: '2554',
  key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  callback_url: `${NGROK_URL}/payment/callback`, // Sử dụng ngrok URL
  frontend_url: 'http://localhost:5173'
};

// Thêm config ZaloPay (sandbox environment)
const ZALOPAY = {
  app_id: '2554',
  key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create'
};

interface CreateZaloPayOrderParams {
  amount: number;
  orderId: string;
  membershipId: number;
  description: string;
  userId: number;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
  ) {
    this.logger.log(`ZaloPay Config loaded with callback URL: ${ZALOPAY_CONFIG.callback_url}`);
  }

  private readonly config = {
    app_id: process.env.ZALOPAY_APP_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: process.env.ZALOPAY_ENDPOINT,
  };

  async create(createPaymentDto: any) {
    try {
      this.logger.log(`Creating payment for user ${createPaymentDto.user_id}, membership ${createPaymentDto.membership_id}`);
      
      // 1. Tạo payment record
      const payment = await this.prisma.payment.create({
        data: {
          amount_paid: createPaymentDto.amount_paid,
          user_id: createPaymentDto.user_id,
          membership_id: createPaymentDto.membership_id,
          status_id: 0, // PENDING - giá trị tạm thời, không phải 1 hay 2
          payment_method: 'ZALOPAY',
          order_id: `PAY${Date.now()}${createPaymentDto.user_id}`
        }
      });

      // 2. Tạo ZaloPay order
      try {
        const embedData = {
          redirecturl: `${ZALOPAY_CONFIG.frontend_url}/payment-status`,
          membership_id: payment.membership_id,
          payment_id: payment.payment_id
        };

        const appTransId = `${moment().format('YYMMDD')}_${payment.order_id}`;
        this.logger.log(`Generated appTransId for ZaloPay: ${appTransId}`);
        
        const orderData = {
          app_id: ZALOPAY_CONFIG.app_id,
          app_trans_id: appTransId,
          app_user: payment.user_id.toString(),
          app_time: Date.now(),
          item: JSON.stringify([]),
          embed_data: JSON.stringify(embedData),
          amount: Number(payment.amount_paid),
          description: `Thanh toán membership #${payment.membership_id}`,
          bank_code: '',
          callback_url: ZALOPAY_CONFIG.callback_url // Thêm callback URL
        };

        this.logger.log('ZaloPay Request:', orderData);

        // Tạo MAC
        const data = 
          orderData.app_id + "|" +
          orderData.app_trans_id + "|" +
          orderData.app_user + "|" +
          orderData.amount + "|" +
          orderData.app_time + "|" +
          orderData.embed_data + "|" +
          orderData.item;

        orderData['mac'] = CryptoJS.HmacSHA256(data, ZALOPAY_CONFIG.key1).toString();

        // Gọi API ZaloPay
        const zaloPayResponse = await axios.post(ZALOPAY_CONFIG.endpoint, null, { 
          params: orderData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        this.logger.log('ZaloPay Response:', zaloPayResponse.data);

        // Cập nhật payment với app_trans_id đầy đủ để có thể tìm thấy trong callback
        await this.prisma.payment.update({
          where: { payment_id: payment.payment_id },
          data: { order_id: appTransId }
        });

        // Trả về kết quả với payment_url từ ZaloPay
        return {
          payment_id: payment.payment_id,
          order_id: payment.order_id,
          payment_url: zaloPayResponse.data.order_url || `${ZALOPAY_CONFIG.frontend_url}/payment?orderId=${payment.order_id}`
        };

      } catch (zaloPayError) {
        this.logger.error('ZaloPay Error:', zaloPayError.response?.data || zaloPayError.message);
        // Nếu có lỗi với ZaloPay, vẫn trả về payment info với mock URL
        return {
          payment_id: payment.payment_id,
          order_id: payment.order_id,
          payment_url: `${ZALOPAY_CONFIG.frontend_url}/payment?orderId=${payment.order_id}`
        };
      }

    } catch (error) {
      this.logger.error('Payment creation error:', error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  async verifyCallback(callbackData: any): Promise<boolean> {
    try {
      const mac = CryptoJS.HmacSHA256(
        callbackData.data, 
        ZALOPAY_CONFIG.key2
      ).toString();
      return mac === callbackData.mac;
    } catch (error) {
      this.logger.error('Verify callback error:', error);
      return false;
    }
  }

  async handleCallback(callbackData: any) {
    try {
      this.logger.log('============= CALLBACK PROCESSING START =============');
      this.logger.log('ZaloPay callback data received:', JSON.stringify(callbackData, null, 2));

      // Nếu callbackData có dạng không mong đợi, ghi log để debug
      if (!callbackData || typeof callbackData !== 'object') {
        this.logger.warn('Invalid callback data format, expected object but got:', typeof callbackData);
        return {
          return_code: 0,
          return_message: 'Invalid data format',
          redirect_url: `${ZALOPAY_CONFIG.frontend_url}/payment-status?error=1&reason=invalid_format`
        };
      }

      // Verify callback data
      const isValid = await this.verifyCallback(callbackData);
      this.logger.log('Callback verification result:', isValid);
      
      if (!isValid) {
        this.logger.warn('Invalid callback signature - MAC verification failed');
        throw new Error('Invalid callback signature');
      }

      try {
        const callbackDataJson = JSON.parse(callbackData.data);
        this.logger.log('Parsed callback data:', JSON.stringify(callbackDataJson, null, 2));
        
        // Validate parsed data
        if (!callbackDataJson.app_trans_id) {
          this.logger.warn('Missing app_trans_id in callback data');
          throw new Error('Missing app_trans_id in callback data');
        }

        // Tìm payment dựa trên app_trans_id
        this.logger.log(`Looking for payment with order_id: ${callbackDataJson.app_trans_id}`);
        let payment = await this.prisma.payment.findFirst({
          where: { 
            order_id: callbackDataJson.app_trans_id 
          }
        });

        // Nếu không tìm thấy payment, thử kiểm tra mà không có prefix date
        if (!payment) {
          this.logger.warn(`Payment not found with exact order_id, trying without date prefix`);
          
          // Tách app_trans_id để lấy phần sau dấu "_" (nếu có)
          const parts = callbackDataJson.app_trans_id.split('_');
          if (parts.length > 1) {
            const orderIdWithoutDatePrefix = parts[1]; // Lấy phần sau dấu "_"
            this.logger.log(`Trying to find payment with order_id (without date prefix): ${orderIdWithoutDatePrefix}`);
            
            payment = await this.prisma.payment.findFirst({
              where: { 
                order_id: orderIdWithoutDatePrefix 
              }
            });
            
            // Nếu tìm thấy, cập nhật lại order_id với định dạng đầy đủ để tránh lỗi trong tương lai
            if (payment) {
              this.logger.log(`Found payment with non-prefixed order_id: ${orderIdWithoutDatePrefix}`);
              await this.prisma.payment.update({
                where: { payment_id: payment.payment_id },
                data: { order_id: callbackDataJson.app_trans_id }
              });
              this.logger.log(`Updated payment order_id to: ${callbackDataJson.app_trans_id}`);
            }
          }
        }

        if (!payment) {
          this.logger.warn(`Payment not found for order_id: ${callbackDataJson.app_trans_id}`);
          throw new Error('Payment not found');
        }

        this.logger.log(`Found payment:`, JSON.stringify(payment, null, 2));

        // Log chi tiết giá trị status từ ZaloPay để debug
        this.logger.log(`ZaloPay status value: ${callbackDataJson.status}, type: ${typeof callbackDataJson.status}`);
        
        // Cập nhật status dựa vào response từ ZaloPay
        // Nếu thành công (status=1) => status_id = 1 (SUCCESS)
        // Nếu thất bại (status!=1) => status_id = 2 (FAILED)
        
        // Sử dụng đồng thời so sánh == và === để đảm bảo nhận cả string và number
        const isSuccess = callbackDataJson.status == 1;
        const status_id = isSuccess ? 1 : 2;
        
        this.logger.log(`Will update payment status to: ${status_id} (${status_id === 1 ? 'SUCCESS' : 'FAILED'})`);
        this.logger.log(`Is success: ${isSuccess}, status from ZaloPay: ${callbackDataJson.status}`);
        
        // Cập nhật payment status
        const updateResult = await this.prisma.payment.update({
          where: { 
            payment_id: payment.payment_id 
          },
          data: {
            status_id: status_id,
            payment_date: new Date()
          }
        });

        this.logger.log(`Payment update result:`, JSON.stringify(updateResult, null, 2));

        const result = {
          return_code: 1,
          return_message: 'success',
          redirect_url: `${ZALOPAY_CONFIG.frontend_url}/payment-status?orderId=${callbackDataJson.app_trans_id}&status=${status_id}`
        };
        
        this.logger.log('Callback response:', JSON.stringify(result, null, 2));
        this.logger.log('============= CALLBACK PROCESSING END =============');
        return result;
      } catch (parseError) {
        this.logger.error('Error parsing callback data:', parseError);
        throw new Error(`Error parsing callback data: ${parseError.message}`);
      }
    } catch (error) {
      this.logger.error('Payment callback error:', error);
      const errorResult = {
        return_code: 0,
        return_message: `Error: ${error.message}`,
        redirect_url: `${ZALOPAY_CONFIG.frontend_url}/payment-status?error=1&message=${encodeURIComponent(error.message)}`
      };
      this.logger.log('Error response:', JSON.stringify(errorResult, null, 2));
      this.logger.log('============= CALLBACK PROCESSING END WITH ERROR =============');
      return errorResult;
    }
  }

  async getPaymentStatus(paymentId: number) {
    return await this.prisma.payment.findUnique({
      where: { payment_id: paymentId },
      select: {
        payment_id: true,
        status_id: true,
        amount_paid: true,
        order_id: true,
        payment_date: true
      }
    });
  }

  async checkPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { order_id: orderId }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }
    
    const statusText = this.getStatusText(payment.status_id);
    const statusDescription = this.getStatusDescription(payment.status_id);
    
    this.logger.log(`Payment status for order ${orderId}: id=${payment.status_id}, text=${statusText}, description=${statusDescription}`);

    return {
      payment_id: payment.payment_id,
      status_id: payment.status_id,
      status: statusText,
      status_description: statusDescription,
      amount: payment.amount_paid,
      order_id: payment.order_id
    };
  }

  private getStatusText(statusId: number): string {
    switch (statusId) {
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
      case 1:
        return 'Thanh toán thành công';
      case 2:
        return 'Thanh toán thất bại';
      default:
        return 'Trạng thái không xác định';
    }
  }
} 