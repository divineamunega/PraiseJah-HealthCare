import { Injectable, NotFoundException } from '@nestjs/common';
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
        data: { status: QueueStatus.WAITING_FOR_PHARMACY },
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
}
