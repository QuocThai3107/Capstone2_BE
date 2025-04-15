import { Type } from 'class-transformer';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class CreateExercisePostDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

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
  tagIds?: number[];
}

export class CreateStepDto {
  @IsString()
  instruction: string;

  @IsOptional()
  @IsString()
  img_url?: string;
} 