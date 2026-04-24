import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VisitsService } from './visits.service.js';
import { CreateVisitDto } from './dto/create-visit.dto.js';
import { UpdateVisitDto } from './dto/update-visit.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ActiveStatusGuard } from '../auth/guards/active-status.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role, type User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuditInterceptor } from '../audit/interceptors/audit.interceptor.js';

@ApiTags('visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveStatusGuard)
@UseInterceptors(AuditInterceptor)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SECRETARY, Role.NURSE)
  @ApiOperation({ summary: 'Check-in a patient (Create visit)' })
  create(@Body() dto: CreateVisitDto, @CurrentUser() user: User) {
    return this.visitsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active visits' })
  findAll() {
    return this.visitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get visit details' })
  findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.SECRETARY, Role.NURSE, Role.DOCTOR)
  @ApiOperation({ summary: 'Update visit info/status' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVisitDto,
    @CurrentUser() user: User,
  ) {
    return this.visitsService.update(id, dto, user);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Mark visit as completed' })
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.visitsService.completeVisit(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a visit' })
  remove(@Param('id') id: string) {
    return this.visitsService.remove(id);
  }
}
