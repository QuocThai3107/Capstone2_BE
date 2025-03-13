import { IsOptional, IsString, Length, IsEmail, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10, { message: 'Số điện thoại phải có đúng 10 số' })
  phoneNum?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  introduction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  healthInformation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  illness?: string;
} 