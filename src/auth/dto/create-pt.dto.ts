import { IsNotEmpty, IsString, IsNumber, Equals } from 'class-validator';

export class CreatePTDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsNumber()
  @Equals(3, { message: 'role_id phải là 3 (PT)' })
  role_id: number;

  @IsNotEmpty()
  @IsString()
  gym: string;
} 