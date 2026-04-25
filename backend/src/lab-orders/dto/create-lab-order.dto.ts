import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateLabOrderDto {
  @ApiProperty({ example: 'uuid-of-visit' })
  @IsNotEmpty()
  @IsUUID()
  readonly visitId!: string;

  @ApiProperty({ example: 'Full Blood Count (FBC)' })
  @IsNotEmpty()
  @IsString()
  readonly testName!: string;

  @ApiPropertyOptional({ example: 'Check for malaria parasites and hemoglobin levels' })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
