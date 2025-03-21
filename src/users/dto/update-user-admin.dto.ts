import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  role_id?: number;

  @IsOptional()
  @IsNumber()
  Status_id?: number;
} 