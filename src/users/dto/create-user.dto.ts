import { IsNotEmpty, IsString, IsNumber, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  role_id: number;

  @IsOptional()
  email?: string;

  @IsOptional()
  phoneNum?: string;

  @IsOptional()
  Status_id?: number;
} 