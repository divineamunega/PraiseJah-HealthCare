import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service.js';
import { PrescriptionsController } from './prescriptions.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LoggerModule } from '../logger/logger.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { VisitsModule } from '../visits/visits.module.js';

@Module({
  imports: [PrismaModule, LoggerModule, AuditModule, VisitsModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
