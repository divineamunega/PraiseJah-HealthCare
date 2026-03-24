import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly firstName!: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName!: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @MinLength(8)
  readonly password!: string;
}
