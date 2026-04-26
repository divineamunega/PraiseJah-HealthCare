import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsInt, Min } from 'class-validator';

export class CreateClinicalNoteDto {
  @ApiProperty({ example: 'uuid-of-visit' })
  @IsNotEmpty()
  @IsUUID()
  readonly visitId!: string;

  @ApiPropertyOptional({ example: 'Persistent cough for 3 days' })
  @IsOptional()
  @IsString()
  readonly chiefComplaint?: string;

  @ApiProperty({ example: 'S: Patient reports cough. O: Lungs clear. A: Viral URTI. P: Rest and fluids.' })
  @IsNotEmpty()
  @IsString()
  readonly content!: string;

  @ApiPropertyOptional({ example: 0, description: 'Version for optimistic concurrency control' })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly version?: bigint;
}
