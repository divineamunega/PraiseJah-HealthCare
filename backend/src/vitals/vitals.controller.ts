import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VitalsService } from './vitals.service.js';
import { CreateVitalDto } from './dto/create-vital.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ActiveStatusGuard } from '../auth/guards/active-status.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role, type User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditInterceptor } from '../audit/interceptors/audit.interceptor.js';

@ApiTags('vitals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveStatusGuard)
@UseInterceptors(AuditInterceptor)
@Controller('vitals')
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.NURSE, Role.DOCTOR)
  @ApiOperation({ summary: 'Record patient vitals' })
  create(@Body() dto: CreateVitalDto, @CurrentUser() user: User) {
    return this.vitalsService.create(dto, user);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recently recorded vitals across all patients' })
  findRecent() {
    return this.vitalsService.findRecent();
  }

  @Get('visit/:visitId')
  @ApiOperation({ summary: 'Get all vital recordings for a specific visit' })
  findByVisit(@Param('visitId') visitId: string) {
    return this.vitalsService.findByVisit(visitId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific vital record details' })
  findOne(@Param('id') id: string) {
    return this.vitalsService.findOne(id);
  }
}
