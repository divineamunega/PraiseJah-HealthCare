import { PartialType } from '@nestjs/swagger';
import { CreateVisitDto } from './create-visit.dto.js';

export class UpdateVisitDto extends PartialType(CreateVisitDto) {}
