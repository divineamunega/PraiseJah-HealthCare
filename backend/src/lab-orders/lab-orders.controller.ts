import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LabOrdersService } from './lab-orders.service.js';
import { CreateLabOrderDto } from './dto/create-lab-order.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { ActiveStatusGuard } from '../auth/guards/active-status.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditInterceptor } from '../audit/interceptors/audit.interceptor.js';

@ApiTags('lab-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ActiveStatusGuard)
@UseInterceptors(AuditInterceptor)
@Controller('lab-orders')
export class LabOrdersController {
  constructor(private readonly labOrdersService: LabOrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Create a laboratory diagnostic order' })
  create(@Body() dto: CreateLabOrderDto, @CurrentUser() user: User) {
    return this.labOrdersService.create(dto, user);
  }

  @Get('visit/:visitId')
  @ApiOperation({ summary: 'Get lab orders for a specific visit' })
  findByVisit(@Param('visitId') visitId: string) {
    return this.labOrdersService.findByVisit(visitId);
  }

  @Post(':visitId/complete')
  @UseGuards(JwtAuthGuard, RolesGuard, ActiveStatusGuard)
  @Roles(Role.LAB_SCIENTIST, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Mark lab orders as completed and return patient to doctor',
  })
  complete(@Param('visitId') visitId: string, @CurrentUser() user: User) {
    return this.labOrdersService.complete(visitId, user);
  }
}
