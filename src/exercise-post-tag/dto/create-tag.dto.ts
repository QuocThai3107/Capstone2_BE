import { IsString, IsOptional } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsOptional()
  tag_name?: string;
} 