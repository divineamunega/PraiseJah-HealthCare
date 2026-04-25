import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

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
}
