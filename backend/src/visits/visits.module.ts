import { Module } from '@nestjs/common';
import { VisitsService } from './visits.service.js';
import { VisitsController } from './visits.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LoggerModule } from '../logger/logger.module.js';
import { AuditModule } from '../audit/audit.module.js';

import { VisitsGateway } from './visits.gateway.js';

@Module({
  imports: [PrismaModule, LoggerModule, AuditModule],
  controllers: [VisitsController],
  providers: [VisitsService, VisitsGateway],
  exports: [VisitsService, VisitsGateway],
})
export class VisitsModule {}
