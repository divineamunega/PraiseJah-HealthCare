import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto.js';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
