import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePlanSlotDto {
  @IsOptional()
  @IsNumber()
  plan_id?: number;

  @IsNotEmpty()
  @IsString()
  no: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
  
  @IsOptional()
  @IsNumber()
  exercisePostId?: number;
} 