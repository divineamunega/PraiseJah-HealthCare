import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'doctor@praisejah.com' })
  @IsEmail()
  email!: string;
}
