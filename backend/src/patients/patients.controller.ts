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
  BadRequestException,
} from '@nestjs/common';
import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';
import { PatientQueryDto } from './dto/patient-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ActiveStatusGuard } from '../auth/guards/active-status.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuditTargetType, AuditAction, Role } from '@prisma/client';
import type { User } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuditInterceptor } from '../audit/interceptors/audit.interceptor.js';
import { Audit } from '../audit/decorators/audit.decorator.js';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveStatusGuard)
@UseInterceptors(AuditInterceptor)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SECRETARY, Role.NURSE, Role.DOCTOR)
  @ApiOperation({ summary: 'Create a new patient' })
  @Audit({
    action: AuditAction.PATIENT_CREATED,
    targetType: AuditTargetType.PATIENT,
  })
  @ApiResponse({
    status: 201,
    description: 'The patient has been successfully created.',
  })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({
    status: 200,
    description: 'List of patients with pagination and sorting.',
  })
  findAll(@Query() queryDto: PatientQueryDto) {
    return this.patientsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient by ID' })
  @Audit({
    action: AuditAction.PATIENT_VIEWED,
    targetType: AuditTargetType.PATIENT,
  })
  @ApiResponse({ status: 200, description: 'The patient details.' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SECRETARY, Role.NURSE, Role.DOCTOR)
  @ApiOperation({ summary: 'Update a patient' })
  @Audit({
    action: AuditAction.PATIENT_UPDATED,
    targetType: AuditTargetType.PATIENT,
  })
  @ApiResponse({
    status: 200,
    description: 'The patient has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @CurrentUser() user: User,
  ) {
    if (!updatePatientDto || Object.keys(updatePatientDto).length === 0) {
      throw new BadRequestException('No update data provided');
    }
    return this.patientsService.update(id, updatePatientDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a patient' })
  @Audit({
    action: AuditAction.PATIENT_DELETED,
    targetType: AuditTargetType.PATIENT,
  })
  @ApiResponse({
    status: 200,
    description: 'The patient has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
