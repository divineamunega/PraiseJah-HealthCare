import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateVitalDto {
  @ApiProperty({ example: 'uuid-of-visit' })
  @IsNotEmpty()
  @IsUUID()
  readonly visitId!: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(250)
  readonly systolicBP?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(150)
  readonly diastolicBP?: number;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(220)
  readonly heartRate?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsNumber()
  @Min(8)
  @Max(60)
  readonly respiratoryRate?: number;

  @ApiPropertyOptional({ example: 36.6 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(45)
  readonly temperatureCelsius?: number;

  @ApiPropertyOptional({ example: 70.5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  readonly weightKg?: number;

  @ApiPropertyOptional({ example: 175.2 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(250)
  readonly heightCm?: number;
}
