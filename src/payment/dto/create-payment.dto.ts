import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  membership_id: number;

  @IsNotEmpty()
  @IsNumber()
  amount_paid: number;

  @IsOptional()
  @IsNumber()
  status_id?: number;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  order_id?: string;
} 