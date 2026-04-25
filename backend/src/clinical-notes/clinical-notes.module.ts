import { Module } from '@nestjs/common';
import { ClinicalNotesService } from './clinical-notes.service.js';
import { ClinicalNotesController } from './clinical-notes.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LoggerModule } from '../logger/logger.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { VisitsModule } from '../visits/visits.module.js';

@Module({
  imports: [PrismaModule, LoggerModule, AuditModule, VisitsModule],
  controllers: [ClinicalNotesController],
  providers: [ClinicalNotesService],
  exports: [ClinicalNotesService],
})
export class ClinicalNotesModule {}
