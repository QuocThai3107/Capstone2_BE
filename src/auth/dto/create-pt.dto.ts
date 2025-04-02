import { IsString, IsOptional, IsEmail, Length, Matches } from 'class-validator';

export class CreatePTDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(3, 64)
  username: string;

  @IsString()
  @Length(6, 64)
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  phoneNum: string;

  @IsString()
  @Length(5, 255)
  address: string;

  @IsString()
  @IsOptional()
  gym?: string; // username của gymowner

  readonly role_id: number = 3; // PT role
  readonly Status_id: number = 1; // Pending status
} 