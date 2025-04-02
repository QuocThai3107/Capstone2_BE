import { IsNumber, IsString, IsOptional } from 'class-validator';

export class ApprovePTDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  Status_id: number;

  @IsString()
  @IsOptional()
  note?: string;
} 