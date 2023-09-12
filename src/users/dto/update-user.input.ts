import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly firstName: string;
  @IsString()
  @IsOptional()
  readonly lastName: string;
  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  readonly email: string;
  @IsOptional()
  readonly avatar: string;
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly passwordHash: string;
}
