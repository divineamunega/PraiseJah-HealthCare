import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { UsersModule } from './users/users.module.js';
import { MailModule } from './mail/mail.module.js';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { configDotenv } from 'dotenv';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { AuditModule } from './audit/audit.module.js';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware.js';
import { PatientsModule } from './patients/patients.module.js';
import { VisitsModule } from './visits/visits.module.js';
import { VitalsModule } from './vitals/vitals.module.js';
import { ClinicalNotesModule } from './clinical-notes/clinical-notes.module.js';
import { LabOrdersModule } from './lab-orders/lab-orders.module.js';
import { PrescriptionsModule } from './prescriptions/prescriptions.module.js';

configDotenv();

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    UsersModule,
    MailModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST?.trim(),
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD?.trim(),
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AuditModule,
    PatientsModule,
    VisitsModule,
    VitalsModule,
    ClinicalNotesModule,
    LabOrdersModule,
    PrescriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
