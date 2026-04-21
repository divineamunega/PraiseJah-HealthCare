import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { PatientQueryDto } from './dto/patient-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AuditTargetType } from '@prisma/client';
import type { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuditInterceptor } from '../audit/interceptors/audit.interceptor.js';
import { Audit } from '../audit/decorators/audit.decorator.js';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @Audit({ action: 'PATIENT_CREATED', targetType: AuditTargetType.PATIENT })
  @ApiResponse({ status: 201, description: 'The patient has been successfully created.' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'List of patients with pagination and sorting.' })
  findAll(@Query() queryDto: PatientQueryDto) {
    return this.patientsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID' })
  @Audit({ action: 'PATIENT_VIEWED', targetType: AuditTargetType.PATIENT })
  @ApiResponse({ status: 200, description: 'The patient details.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient' })
  @Audit({ action: 'PATIENT_UPDATED', targetType: AuditTargetType.PATIENT })
  @ApiResponse({ status: 200, description: 'The patient has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: User,
  ) {
    return this.patientsService.update(id, updatePatientDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a patient' })
  @Audit({ action: 'PATIENT_DELETED', targetType: AuditTargetType.PATIENT })
  @ApiResponse({ status: 200, description: 'The patient has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
