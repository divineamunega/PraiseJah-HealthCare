import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditService } from './audit.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuditInterceptor } from './interceptors/audit.interceptor.js';

@Module({
  imports: [PrismaModule],
  providers: [
    AuditService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
