import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClinicalNotesService } from './clinical-notes.service.js';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ActiveStatusGuard } from '../auth/guards/active-status.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditInterceptor } from '../audit/interceptors/audit.interceptor.js';

@ApiTags('clinical-notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveStatusGuard)
@UseInterceptors(AuditInterceptor)
@Controller('clinical-notes')
export class ClinicalNotesController {
  constructor(private readonly clinicalNotesService: ClinicalNotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Add a clinical encounter note' })
  create(@Body() dto: CreateClinicalNoteDto, @CurrentUser() user: User) {
    return this.clinicalNotesService.create(dto, user);
  }

  @Get('visit/:visitId')
  @ApiOperation({ summary: 'Get documentation for a specific visit' })
  findByVisit(@Param('visitId') visitId: string) {
    return this.clinicalNotesService.findByVisit(visitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific clinical note details' })
  findOne(@Param('id') id: string) {
    return this.clinicalNotesService.findOne(id);
  }
}
