import { Module } from '@nestjs/common';
import { LabOrdersService } from './lab-orders.service.js';
import { LabOrdersController } from './lab-orders.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LoggerModule } from '../logger/logger.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { VisitsModule } from '../visits/visits.module.js';

@Module({
  imports: [PrismaModule, LoggerModule, AuditModule, VisitsModule],
  controllers: [LabOrdersController],
  providers: [LabOrdersService],
  exports: [LabOrdersService],
})
export class LabOrdersModule {}
