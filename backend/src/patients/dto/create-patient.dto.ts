import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
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
  @Type(() => Date)
  @IsDate()
  readonly dateOfBirth!: Date;

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
