import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { VisitStatus } from '@prisma/client';

export class CreateVisitDto {
  @ApiProperty({ example: 'uuid-of-patient' })
  @IsNotEmpty()
  @IsUUID()
  readonly patientId!: string;

  @ApiPropertyOptional({ example: 'uuid-of-doctor' })
  @IsOptional()
  @IsUUID()
  readonly doctorId?: string;

  @ApiPropertyOptional({ enum: VisitStatus, default: VisitStatus.CREATED })
  @IsOptional()
  @IsEnum(VisitStatus)
  readonly status?: VisitStatus = VisitStatus.CREATED;
}
