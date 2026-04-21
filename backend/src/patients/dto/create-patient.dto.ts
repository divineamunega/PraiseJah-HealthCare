import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Sex } from '@prisma/client';

export class CreatePatientDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  readonly firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  readonly lastName!: string;

  @ApiProperty({ example: '1990-01-01', description: 'ISO 8601 date string' })
  @IsNotEmpty()
  @IsDateString()
  readonly dateOfBirth!: string;

  @ApiProperty({ enum: Sex, example: Sex.MALE })
  @IsEnum(Sex, { message: 'sex must be a valid Sex enum value' })
  readonly sex!: Sex;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiPropertyOptional({ example: '123 Health Way, Lagos' })
  @IsOptional()
  @IsString()
  readonly address?: string;
}
