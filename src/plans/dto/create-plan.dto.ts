import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePlanSlotDto } from '../../plan-slots/dto/create-plan-slot.dto';

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
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanSlotDto)
  planSlots?: CreatePlanSlotDto[];
} 