import { IsEmail, IsNotEmpty } from 'class-validator';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}

export default LoginDto;
