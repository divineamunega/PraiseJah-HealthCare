import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVitalDto } from './dto/create-vital.dto.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';
import { VisitsGateway } from '../visits/visits.gateway.js';
import { AuditAction, AuditTargetType, QueueStatus, User } from '@prisma/client';

@Injectable()
export class VitalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
    private readonly visitsGateway: VisitsGateway,
  ) {}

  async create(dto: CreateVitalDto, actor: User) {
    // 1. Verify visit exists and is active
    const visit = await this.prisma.visit.findFirst({
      where: { id: dto.visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${dto.visitId} not found`);
    }

    // 2. Perform recording and queue transition in a transaction
    const vital = await this.prisma.$transaction(async (tx) => {
      // Create the vital record
      const newVital = await tx.vital.create({
        data: {
          visitId: dto.visitId,
          recordedById: actor.id,
          systolicBP: dto.systolicBP,
          diastolicBP: dto.diastolicBP,
          heartRate: dto.heartRate,
          respiratoryRate: dto.respiratoryRate,
          temperatureCelsius: dto.temperatureCelsius,
          weightKg: dto.weightKg,
          heightCm: dto.heightCm,
        },
      });

      // Advance the patient in the clinical queue
      await tx.queueEntry.update({
        where: { visitId: dto.visitId },
        data: { 
          status: QueueStatus.READY_FOR_DOCTOR,
          userId: actor.id // Track the nurse who performed triage
        },
      });

      return newVital;
    });

    // 3. Broadcast real-time update to all dashboards (Nurses and Doctors)
    this.visitsGateway.broadcastQueueUpdate();
    this.visitsGateway.broadcastVisitUpdate(dto.visitId);

    // 4. Record clinical audit trail
    await this.auditService.createLog({
      actorId: actor.id,
      action: AuditAction.VITALS_RECORDED,
      targetType: AuditTargetType.VITAL,
      targetId: vital.id,
      metadata: { visitId: dto.visitId },
    }).catch(err => this.logger.error(`Clinical audit failed: ${err.message}`));

    return vital;
  }

  async findByVisit(visitId: string) {
    return this.prisma.vital.findMany({
      where: { visitId, deletedAt: null },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async findRecent() {
    return this.prisma.vital.findMany({
      where: { deletedAt: null },
      take: 10,
      orderBy: { recordedAt: 'desc' },
      include: {
        visit: {
          include: {
            patient: {
              select: { firstName: true, lastName: true, sex: true }
            }
          }
        },
      }
    });
  }

  async findOne(id: string) {
    const vital = await this.prisma.vital.findFirst({
      where: { id, deletedAt: null },
    });

    if (!vital) {
      throw new NotFoundException(`Vital record with ID ${id} not found`);
    }

    return vital;
  }
}
