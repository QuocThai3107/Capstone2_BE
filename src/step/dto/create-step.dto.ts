import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStepDto {
  @IsNumber()
  exercisepost_id: number;

  @IsString()
  step_number: string;

  @IsString()
  @IsOptional()
  instruction?: string;

  @IsString()
  @IsOptional()
  img_url?: string;
} 