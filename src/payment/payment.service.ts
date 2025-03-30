import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  private readonly config = {
    app_id: process.env.ZALOPAY_APP_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: process.env.ZALOPAY_ENDPOINT,
  };

  async create(createPaymentDto: CreatePaymentDto) {
    try {
      console.log('CreatePaymentDto:', createPaymentDto);

      if (!createPaymentDto.amount_paid || !createPaymentDto.user_id || !createPaymentDto.membership_id) {
        throw new Error('Missing required fields');
      }

      const payment = await this.prisma.payment.create({
        data: {
          amount_paid: createPaymentDto.amount_paid,
          user_id: createPaymentDto.user_id,
          membership_id: createPaymentDto.membership_id,
          status_id: 1
        }
      });
      return payment;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new Error('Không thể tạo thanh toán: ' + error.message);
    }
  }

  private async createZaloPayOrder({
    amount,
    orderId,
    description,
  }) {
    const embedData = JSON.stringify({
      redirecturl: process.env.FRONTEND_URL || 'http://localhost:3001'
    });

    const items = [{ itemid: "knb", itemname: "membership", itemprice: amount, itemquantity: 1 }];
    const order = {
      app_id: this.config.app_id,
      app_trans_id: orderId,
      app_user: "user123",
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: embedData,
      amount: amount,
      description: description,
      bank_code: "",
    };

    // Tạo MAC
    const data = this.config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    const mac = crypto.createHmac('sha256', this.config.key1)
      .update(data)
      .digest('hex');

    const orderData = {
      ...order,
      mac: mac
    };

    try {
      const response = await axios.post(
        `${this.config.endpoint}/create`,
        orderData
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Không thể tạo đơn hàng ZaloPay',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async handleCallback(callbackData: any) {
    try {
      // Verify MAC từ ZaloPay
      const isValidSignature = this.verifyZaloPayCallback(callbackData);
      if (!isValidSignature) {
        return {
          return_code: -1,
          return_message: 'mac not equal'
        };
      }

      // Parse data từ callback
      const data = JSON.parse(callbackData.data);
      
      // Tìm payment dựa trên order_id trước
      const payment = await this.prisma.payment.findFirst({
        where: {
          order_id: data.app_trans_id
        }
      });

      if (!payment) {
        throw new Error('Không tìm thấy payment');
      }

      // Cập nhật trạng thái payment sử dụng payment_id
      await this.prisma.payment.update({
        where: {
          payment_id: payment.payment_id  // Sử dụng payment_id thay vì order_id
        },
        data: {
          status_id: callbackData.type === 1 ? 1 : 3 // 1: Success, 3: Failed
        }
      });

      return {
        return_code: 1,
        return_message: 'success'
      };
    } catch (error) {
      return {
        return_code: -1,
        return_message: 'internal server error'
      };
    }
  }

  private verifyZaloPayCallback(callbackData: any) {
    // Implement verify logic here using key2
    const data = callbackData.data;
    const requestMac = callbackData.mac;
    const mac = crypto.createHmac('sha256', this.config.key2)
      .update(data)
      .digest('hex');
    return mac === requestMac;
  }

  async checkPaymentStatus(orderId: string) {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { order_id: orderId }
      });

      if (!payment) {
        throw new HttpException(
          'Không tìm thấy thanh toán',
          HttpStatus.NOT_FOUND
        );
      }

      // Kiểm tra trạng thái với ZaloPay
      const zaloPayStatus = await this.checkZaloPayStatus(orderId);

      return {
        payment,
        zaloPayStatus
      };
    } catch (error) {
      throw new HttpException(
        'Không thể kiểm tra trạng thái thanh toán',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async checkZaloPayStatus(orderId: string) {
    const data = this.config.app_id + "|" + orderId + "|" + this.config.key1;
    const mac = crypto.createHmac('sha256', this.config.key1)
      .update(data)
      .digest('hex');

    try {
      const response = await axios.post(
        `${this.config.endpoint}/query`,
        {
          app_id: this.config.app_id,
          app_trans_id: orderId,
          mac: mac
        }
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Không thể kiểm tra trạng thái ZaloPay',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 