import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service.js';
import { CreatePrescriptionDto } from './dto/create-prescription.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ActiveStatusGuard } from '../auth/guards/active-status.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditInterceptor } from '../audit/interceptors/audit.interceptor.js';

@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveStatusGuard)
@UseInterceptors(AuditInterceptor)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.DOCTOR, Role.NURSE)
  @ApiOperation({ summary: 'Issue an electronic prescription' })
  create(@Body() dto: CreatePrescriptionDto, @CurrentUser() user: User) {
    return this.prescriptionsService.create(dto, user);
  }

  @Get('visit/:visitId')
  @ApiOperation({ summary: 'Get prescriptions for a specific visit' })
  findByVisit(@Param('visitId') visitId: string) {
    return this.prescriptionsService.findByVisit(visitId);
  }
}
