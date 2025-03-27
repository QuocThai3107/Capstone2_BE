import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsNumberString } from 'class-validator';

export class CreateExercisePostDto {
  @IsNumberString()
  user_id: number | string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @IsOptional()
  @IsString()
  video_rul?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps?: CreateStepDto[];

  @IsOptional()
  @IsArray()
  tagIds?: number[] | string | string[];
}

export class CreateStepDto {
  @IsNumberString()
  stepNumber: string | number;

  @IsString()
  instruction: string;

  @IsOptional()
  @IsString()
  imgUrl?: string;
} 