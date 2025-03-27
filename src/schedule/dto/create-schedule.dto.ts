import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsNumber()
  plan_id: number;

  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsDateString()
  start_hour?: Date;

  @IsOptional()
  @IsDateString()
  end_hour?: Date;
} 