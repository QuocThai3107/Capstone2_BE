import { IsNotEmpty, IsString, IsNumber, Equals } from 'class-validator';

export class CreatePTDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  gym: string;
} 