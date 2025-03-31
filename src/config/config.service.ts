import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get zaloPayConfig() {
    return {
      app_id: this.configService.get<string>('ZALOPAY_APP_ID'),
      key1: this.configService.get<string>('ZALOPAY_KEY1'),
      key2: this.configService.get<string>('ZALOPAY_KEY2'),
      endpoint: this.configService.get<string>('ZALOPAY_ENDPOINT'),
      callback_url: this.configService.get<string>('ZALOPAY_CALLBACK_URL'),
      frontend_url: this.configService.get<string>('FRONTEND_URL'),
    };
  }
} 