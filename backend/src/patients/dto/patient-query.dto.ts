import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export enum PatientSortBy {
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  CREATED_AT = 'createdAt',
  DATE_OF_BIRTH = 'dateOfBirth',
}

export class PatientQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'John', description: 'Search by first or last name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+2348012345678', description: 'Search by phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: PatientSortBy, default: PatientSortBy.CREATED_AT })
  @IsEnum(PatientSortBy)
  @IsOptional()
  sortBy: PatientSortBy = PatientSortBy.CREATED_AT;
}
