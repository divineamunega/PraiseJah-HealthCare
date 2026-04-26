import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  readonly firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  readonly lastName!: string;

  @ApiProperty({ example: 'john.doe@praisejah.com' })
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ enum: Role, example: Role.DOCTOR })
  @IsEnum(Role, { message: 'role must be a valid Role enum value' })
  readonly role!: Role;
}
