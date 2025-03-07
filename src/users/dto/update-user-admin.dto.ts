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
  roleId?: number;

  @IsOptional()
  @IsNumber()
  statusId?: number;
} 