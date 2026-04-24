import { Module } from '@nestjs/common';
import { VitalsService } from './vitals.service.js';
import { VitalsController } from './vitals.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LoggerModule } from '../logger/logger.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { VisitsModule } from '../visits/visits.module.js';

@Module({
  imports: [PrismaModule, LoggerModule, AuditModule, VisitsModule],
  controllers: [VitalsController],
  providers: [VitalsService],
  exports: [VitalsService],
})
export class VitalsModule {}
