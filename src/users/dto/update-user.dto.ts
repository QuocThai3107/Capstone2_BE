import { IsOptional, IsString, Length, IsEmail, MaxLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Tên không được quá 50 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10, { message: 'Số điện thoại phải có đúng 10 số' })
  @Matches(/^[0-9]+$/, { message: 'Số điện thoại chỉ được chứa các chữ số' })
  phoneNum?: string;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255, { message: 'Email không được quá 255 ký tự' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Giới thiệu không được quá 1000 ký tự' })
  introduction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Thông tin sức khỏe không được quá 1000 ký tự' })
  healthInformation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Thông tin bệnh lý không được quá 1000 ký tự' })
  illness?: string;
} 