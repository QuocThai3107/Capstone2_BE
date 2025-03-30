import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import * as moment from 'moment';

// Thêm config trực tiếp trong service
const ZALOPAY_CONFIG = {
  app_id: '2554',
  key1: 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn',
  key2: 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf',
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  callback_url: 'http://localhost:3000/payment/callback',
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
    console.log('ZaloPay Config loaded:', {
      app_id: process.env.ZALOPAY_APP_ID,
      endpoint: process.env.ZALOPAY_ENDPOINT,
      hasKey1: !!process.env.ZALOPAY_KEY1
    });
  }

  private readonly config = {
    app_id: process.env.ZALOPAY_APP_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: process.env.ZALOPAY_ENDPOINT,
  };

  async create(createPaymentDto: any) {
    try {
      // 1. Tạo payment record
      const payment = await this.prisma.payment.create({
        data: {
          amount_paid: createPaymentDto.amount_paid,
          user_id: createPaymentDto.user_id,
          membership_id: createPaymentDto.membership_id,
          status_id: 1,
          payment_method: 'ZALOPAY',
          order_id: `PAY${Date.now()}${createPaymentDto.user_id}`
        }
      });

      // 2. Tạo ZaloPay order
      try {
        const embedData = {
          redirecturl: 'http://localhost:5173/payment-status',
          membership_id: payment.membership_id
        };

        const orderData = {
          app_id: ZALOPAY.app_id,
          app_trans_id: `${moment().format('YYMMDD')}_${payment.order_id}`,
          app_user: payment.user_id.toString(),
          app_time: Date.now(),
          item: JSON.stringify([]),
          embed_data: JSON.stringify(embedData),
          amount: Number(payment.amount_paid),
          description: `Thanh toán membership #${payment.membership_id}`,
          bank_code: ''
        };

        console.log('ZaloPay Request:', orderData);

        // Tạo MAC
        const data = 
          orderData.app_id + "|" +
          orderData.app_trans_id + "|" +
          orderData.app_user + "|" +
          orderData.amount + "|" +
          orderData.app_time + "|" +
          orderData.embed_data + "|" +
          orderData.item;

        orderData['mac'] = CryptoJS.HmacSHA256(data, ZALOPAY.key1).toString();

        // Gọi API ZaloPay
        const zaloPayResponse = await axios.post(ZALOPAY.endpoint, null, { 
          params: orderData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        console.log('ZaloPay Response:', zaloPayResponse.data);

        // Trả về kết quả với payment_url từ ZaloPay
        return {
          payment_id: payment.payment_id,
          order_id: payment.order_id,
          payment_url: zaloPayResponse.data.order_url || `http://localhost:5173/payment?orderId=${payment.order_id}`
        };

      } catch (zaloPayError) {
        console.error('ZaloPay Error:', zaloPayError.response?.data || zaloPayError.message);
        // Nếu có lỗi với ZaloPay, vẫn trả về payment info với mock URL
        return {
          payment_id: payment.payment_id,
          order_id: payment.order_id,
          payment_url: `http://localhost:5173/payment?orderId=${payment.order_id}`
        };
      }

    } catch (error) {
      console.error('Payment creation error:', error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  async verifyCallback(callbackData: any): Promise<boolean> {
    const mac = CryptoJS.HmacSHA256(
      callbackData.data, 
      process.env.ZALOPAY_KEY2
    ).toString();
    return mac === callbackData.mac;
  }

  async handleCallback(callbackData: any) {
    try {
      console.log('Received callback data:', callbackData);

      // Verify callback data
      if (!this.verifyCallback(callbackData)) {
        throw new Error('Invalid callback signature');
      }

      const callbackDataJson = JSON.parse(callbackData.data);
      console.log('Parsed callback data:', callbackDataJson);

      // Tìm payment dựa trên app_trans_id
      const payment = await this.prisma.payment.findFirst({
        where: { 
          order_id: callbackDataJson.app_trans_id 
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Cập nhật status dựa vào response từ ZaloPay
      const status_id = callbackDataJson.status === 1 ? 2 : 3; // 2: SUCCESS, 3: FAILED
      
      // Cập nhật payment status
      await this.prisma.payment.update({
        where: { 
          payment_id: payment.payment_id 
        },
        data: {
          status_id: status_id,
          // Có thể thêm các trường khác cần update
        }
      });

      console.log(`Updated payment ${payment.payment_id} status to ${status_id}`);

      return {
        return_code: callbackDataJson.status,
        return_message: callbackDataJson.status === 1 ? 'success' : 'failed',
        redirect_url: `http://localhost:5173/payment-status?orderId=${callbackDataJson.app_trans_id}&status=${status_id}`
      };

    } catch (error) {
      console.error('Payment callback error:', error);
      throw new Error('Không thể xử lý callback: ' + error.message);
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

    return {
      payment_id: payment.payment_id,
      status_id: payment.status_id,
      status: this.getStatusText(payment.status_id),
      amount: payment.amount_paid
    };
  }

  private getStatusText(statusId: number): string {
    switch (statusId) {
      case 1:
        return 'PENDING';
      case 2:
        return 'SUCCESS';
      case 3:
        return 'FAILED';
      default:
        return 'UNKNOWN';
    }
  }
} 