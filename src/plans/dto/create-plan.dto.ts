import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsOptional()
  planName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  totalDuration?: number;
} 