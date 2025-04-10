import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  plan_id?: number;

  @IsOptional()
  @IsString()
  day: string | Date;

  @IsOptional()
  @IsDateString()
  start_hour?: string | Date;

  @IsOptional()
  @IsDateString()
  end_hour?: string | Date;
} 