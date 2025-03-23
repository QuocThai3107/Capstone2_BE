import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  plan_name: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  total_duration?: number;
} 