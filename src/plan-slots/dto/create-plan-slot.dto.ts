import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePlanSlotDto {
  @IsNumber()
  planId: number;

  @IsNumber()
  no: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsNumber()
  duration: number;
} 