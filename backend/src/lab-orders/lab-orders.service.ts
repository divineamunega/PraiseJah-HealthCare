import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLabOrderDto } from './dto/create-lab-order.dto.js';
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
export class LabOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
    private readonly visitsGateway: VisitsGateway,
  ) {}

  async create(dto: CreateLabOrderDto, actor: User) {
    // 1. Verify visit exists
    const visit = await this.prisma.visit.findFirst({
      where: { id: dto.visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${dto.visitId} not found`);
    }

    // 2. Create Lab Order and Update Queue in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.labOrder.create({
        data: {
          visitId: dto.visitId,
          orderedById: actor.id,
          testName: dto.testName,
          notes: dto.notes,
        },
      });

      // Update the queue status to indicate the patient is now waiting for lab work
      await tx.queueEntry.update({
        where: { visitId: dto.visitId },
        data: { status: QueueStatus.WAITING_FOR_LAB },
      });

      return newOrder;
    });

    // 3. Broadcast real-time update
    this.visitsGateway.broadcastQueueUpdate();
    this.visitsGateway.broadcastVisitUpdate(dto.visitId);

    // 4. Record clinical audit trail
    await this.auditService
      .createLog({
        actorId: actor.id,
        action: AuditAction.LAB_ORDER_CREATED,
        targetType: AuditTargetType.LAB_ORDER,
        targetId: order.id,
        metadata: { visitId: dto.visitId, testName: dto.testName },
      })
      .catch((err) =>
        this.logger.error(`Clinical audit failed: ${err.message}`),
      );

    return order;
  }

  async findByVisit(visitId: string) {
    return this.prisma.labOrder.findMany({
      where: { visitId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async complete(visitId: string, actor: User) {
    // 1. Verify visit exists
    const visit = await this.prisma.visit.findFirst({
      where: { id: visitId, deletedAt: null },
      include: { queueEntry: true },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    // 2. Update queue status to READY_FOR_DOCTOR in a transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.queueEntry.update({
        where: { visitId },
        data: {
          status: QueueStatus.READY_FOR_DOCTOR,
          userId: actor.id,
        },
      });
    });

    // 3. Broadcast real-time update
    this.visitsGateway.broadcastQueueUpdate();
    this.visitsGateway.broadcastVisitUpdate(visitId);

    // 4. Record audit log
    await this.auditService
      .createLog({
        actorId: actor.id,
        action: AuditAction.LAB_ORDER_COMPLETED,
        targetType: AuditTargetType.VISIT,
        targetId: visitId,
        metadata: { visitId },
      })
      .catch((err) =>
        this.logger.error(`Clinical audit failed: ${err.message}`),
      );

    return { success: true };
  }
}
