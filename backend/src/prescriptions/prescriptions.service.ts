import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePrescriptionDto } from './dto/create-prescription.dto.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';
import { VisitsGateway } from '../visits/visits.gateway.js';
import {
  AuditAction,
  AuditTargetType,
  QueueStatus,
  User,
  VisitStatus,
} from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
    private readonly visitsGateway: VisitsGateway,
  ) {}

  async create(dto: CreatePrescriptionDto, actor: User) {
    // 1. Verify visit exists
    const visit = await this.prisma.visit.findFirst({
      where: { id: dto.visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${dto.visitId} not found`);
    }

    // 2. Create Prescription and Update Queue in a transaction
    const prescription = await this.prisma.$transaction(async (tx) => {
      const newPrescription = await tx.prescription.create({
        data: {
          visitId: dto.visitId,
          prescriberId: actor.id,
          medication: dto.medication,
          dosage: dto.dosage,
          frequency: dto.frequency,
          duration: dto.duration,
          notes: dto.notes,
        },
      });

      // Update the queue status to indicate the patient is now waiting for pharmacy
      await tx.queueEntry.update({
        where: { visitId: dto.visitId },
        data: {
          status: QueueStatus.WAITING_FOR_PHARMACY,
          userId: actor.id,
        },
      });

      return newPrescription;
    });

    // 3. Broadcast real-time update
    this.visitsGateway.broadcastQueueUpdate();
    this.visitsGateway.broadcastVisitUpdate(dto.visitId);

    // 4. Record clinical audit trail
    await this.auditService
      .createLog({
        actorId: actor.id,
        action: AuditAction.PRESCRIPTION_ISSUED,
        targetType: AuditTargetType.PRESCRIPTION,
        targetId: prescription.id,
        metadata: { visitId: dto.visitId, medication: dto.medication },
      })
      .catch((err) =>
        this.logger.error(`Clinical audit failed: ${err.message}`),
      );

    return prescription;
  }

  async findByVisit(visitId: string) {
    return this.prisma.prescription.findMany({
      where: { visitId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPharmacyQueue() {
    return this.prisma.visit.findMany({
      where: {
        deletedAt: null,
        status: { not: VisitStatus.COMPLETED },
        queueEntry: { is: { status: QueueStatus.WAITING_FOR_PHARMACY } },
        prescriptions: { some: { deletedAt: null } },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sex: true,
            dateOfBirth: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        queueEntry: true,
        prescriptions: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async dispense(visitId: string, actor: User) {
    const visit = await this.prisma.visit.findFirst({
      where: { id: visitId, deletedAt: null },
      include: {
        queueEntry: true,
        prescriptions: {
          where: { deletedAt: null },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    if (visit.prescriptions.length === 0) {
      throw new BadRequestException(
        'No active prescriptions found for this visit',
      );
    }

    if (visit.queueEntry?.status !== QueueStatus.WAITING_FOR_PHARMACY) {
      throw new BadRequestException(
        'This visit is not currently waiting in pharmacy queue',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.COMPLETED },
      });

      await tx.queueEntry.update({
        where: { visitId },
        data: {
          status: QueueStatus.DONE,
          userId: actor.id,
        },
      });
    });

    this.visitsGateway.broadcastQueueUpdate();
    this.visitsGateway.broadcastVisitUpdate(visitId);

    await this.auditService
      .createLog({
        actorId: actor.id,
        action: AuditAction.VISIT_UPDATED,
        targetType: AuditTargetType.VISIT,
        targetId: visitId,
        metadata: {
          event: 'PRESCRIPTIONS_DISPENSED',
          dispensedCount: visit.prescriptions.length,
        },
      })
      .catch((err) =>
        this.logger.error(`Clinical audit failed: ${err.message}`),
      );

    return {
      success: true,
      visitId,
      dispensedCount: visit.prescriptions.length,
    };
  }
}
