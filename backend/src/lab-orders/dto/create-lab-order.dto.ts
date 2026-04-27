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

  @ApiPropertyOptional({
    example: 'Check for malaria parasites and hemoglobin levels',
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}

export class CreateBulkLabOrdersDto {
  @ApiProperty({ example: 'uuid-of-visit' })
  @IsNotEmpty()
  @IsUUID()
  readonly visitId!: string;

  @ApiProperty({ example: ['FBC', 'Malaria Parasite'] })
  @IsNotEmpty()
  @IsString({ each: true })
  readonly testNames!: string[];

  @ApiPropertyOptional({ example: 'Urgent' })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}

export class CompleteLabOrderResultsDto {
  @ApiProperty({ example: { hb: 13.5, wbc: 5000 } })
  @IsNotEmpty()
  readonly results!: Record<string, any>;
}
