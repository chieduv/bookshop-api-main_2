import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  readonly passwordConfirm: string;

  @IsString()
  readonly firstName?: string;

  @IsOptional()
  readonly avatar?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;
}
