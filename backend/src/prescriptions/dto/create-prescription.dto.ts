import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreatePrescriptionDto {
  @ApiProperty({ example: 'uuid-of-visit' })
  @IsNotEmpty()
  @IsUUID()
  readonly visitId!: string;

  @ApiProperty({ example: 'Paracetamol' })
  @IsNotEmpty()
  @IsString()
  readonly medication!: string;

  @ApiProperty({ example: '500mg' })
  @IsNotEmpty()
  @IsString()
  readonly dosage!: string;

  @ApiProperty({ example: 'Twice daily' })
  @IsNotEmpty()
  @IsString()
  readonly frequency!: string;

  @ApiPropertyOptional({ example: '5 days' })
  @IsOptional()
  @IsString()
  readonly duration?: string;

  @ApiPropertyOptional({ example: 'Take after meals' })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
