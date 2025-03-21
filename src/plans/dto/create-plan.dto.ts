import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @IsNumber()
  user_id: number;

  @IsString()
  @IsOptional()
  plan_name?: string;

  @IsString()
  @IsOptional()
  Description?: string;

  @IsNumber()
  @IsOptional()
  total_duration?: number;
} 