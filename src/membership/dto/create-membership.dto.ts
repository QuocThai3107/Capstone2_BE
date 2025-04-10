import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateMembershipDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  membership_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  membership_type: number; // mặc định là 2 (gymmembership)

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  duration: number; // Số ngày của gói membership
} 