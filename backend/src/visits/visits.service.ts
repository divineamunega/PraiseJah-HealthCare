import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVisitDto } from './dto/create-visit.dto.js';
import { UpdateVisitDto } from './dto/update-visit.dto.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';
import {
  AuditAction,
  AuditTargetType,
  Prisma,
  QueueStatus,
  Role,
  VisitStatus,
  User,
} from '@prisma/client';
import { VisitsGateway } from './visits.gateway.js';

@Injectable()
export class VisitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
    private readonly visitsGateway: VisitsGateway,
  ) {}

  async create(dto: CreateVisitDto, actor: User) {
    // 1. Check if patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${dto.patientId} not found`);
    }

    // 2. Prevent multiple active visits for the same patient
    const activeVisit = await this.prisma.visit.findFirst({
      where: {
        patientId: dto.patientId,
        status: { in: [VisitStatus.CREATED, VisitStatus.IN_PROGRESS] },
        deletedAt: null,
      },
    });

    if (activeVisit) {
      throw new ConflictException(
        'This patient already has an active visit. Please complete the current visit before checking in again.',
      );
    }

    // 3. Create Visit and QueueEntry in a transaction
    const visit = await this.prisma.$transaction(async (tx) => {
      const newVisit = await tx.visit.create({
        data: {
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          status: dto.status,
        },
      });

      await tx.queueEntry.create({
        data: {
          visitId: newVisit.id,
          status: QueueStatus.WAITING_FOR_VITALS,
        },
      });

      return newVisit;
    });

    // Broadcast queue update to clinical staff
    this.visitsGateway.broadcastQueueUpdate();

    await this.auditService
      .createLog({
        actorId: actor.id,
        action: AuditAction.VISIT_CREATED,
        targetType: AuditTargetType.VISIT,
        targetId: visit.id,
        metadata: { patientId: dto.patientId },
      })
      .catch((err) => this.logger.error(`Audit failed: ${err.message}`));

    return visit;
  }

  async findAll() {
    return this.prisma.visit.findMany({
      where: { deletedAt: null },
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
          select: { firstName: true, lastName: true },
        },
        queueEntry: true,
        vitals: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const visit = await this.prisma.visit.findFirst({
      where: { id, deletedAt: null },
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
        doctor: { select: { id: true, firstName: true, lastName: true } },
        queueEntry: true,
        vitals: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    return visit;
  }

  async update(id: string, dto: UpdateVisitDto, actor: User) {
    const existing = await this.findOne(id);

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    const updateData: Prisma.VisitUncheckedUpdateInput = { ...dto };

    if (actor.role === Role.DOCTOR && dto.status === VisitStatus.IN_PROGRESS) {
      if (dto.doctorId && dto.doctorId !== actor.id) {
        throw new BadRequestException(
          'Doctor encounter start must use the authenticated doctorId',
        );
      }

      updateData.doctorId = actor.id;
    }

    if (
      actor.role === Role.DOCTOR &&
      updateData.status === VisitStatus.IN_PROGRESS &&
      !updateData.doctorId
    ) {
      throw new BadRequestException(
        'Doctor encounter cannot start without doctor assignment',
      );
    }

    const updated = await this.prisma.visit.update({
      where: { id },
      data: updateData,
    });

    // Broadcast visit update
    this.visitsGateway.broadcastVisitUpdate(id);
    this.visitsGateway.broadcastQueueUpdate();

    await this.auditService
      .createLog({
        actorId: actor.id,
        action: AuditAction.VISIT_UPDATED,
        targetType: AuditTargetType.VISIT,
        targetId: id,
        metadata: { old: existing.status, new: updated.status },
      })
      .catch((err) => this.logger.error(`Audit failed: ${err.message}`));

    return updated;
  }

  async completeVisit(id: string, actor: User) {
    const existing = await this.prisma.visit.findFirst({
      where: { id, deletedAt: null },
      include: {
        queueEntry: true,
        prescriptions: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    const hasPrescriptions = existing.prescriptions.length > 0;
    
    // If the doctor is finishing, and there are prescriptions, 
    // we just move the patient to the pharmacy queue.
    // The visit only truly "COMPLETES" when the pharmacy dispenses.
    if (hasPrescriptions && existing.queueEntry?.status !== QueueStatus.DONE) {
       await this.prisma.queueEntry.update({
         where: { visitId: id },
         data: { status: QueueStatus.WAITING_FOR_PHARMACY },
       });
       
       this.visitsGateway.broadcastQueueUpdate();
       this.visitsGateway.broadcastVisitUpdate(id);
       
       // Log this as a transition
       await this.auditService.createLog({
         actorId: actor.id,
         action: AuditAction.VISIT_UPDATED,
         targetType: AuditTargetType.VISIT,
         targetId: id,
         metadata: { event: 'MOVED_TO_PHARMACY' }
       }).catch(err => this.logger.error(`Audit failed: ${err.message}`));

       return { 
         success: true,
         message: 'Patient moved to pharmacy queue.' 
       };
    }

    // If no prescriptions, we can close the visit entirely
    const visit = await this.prisma.visit.update({
      where: { id },
      data: { status: VisitStatus.COMPLETED },
    });

    await this.prisma.queueEntry.update({
      where: { visitId: id },
      data: { status: QueueStatus.DONE },
    });

    // Broadcast completion to update all dashboards
    this.visitsGateway.broadcastQueueUpdate();
    this.visitsGateway.broadcastVisitUpdate(id);

    await this.auditService
      .createLog({
        actorId: actor.id,
        action: AuditAction.VISIT_COMPLETED,
        targetType: AuditTargetType.VISIT,
        targetId: id,
      })
      .catch((err) => this.logger.error(`Audit failed: ${err.message}`));

    return visit;
  }

  async remove(id: string) {
    await this.findOne(id);
    const result = await this.prisma.visit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Broadcast removal
    this.visitsGateway.broadcastQueueUpdate();

    return result;
  }
}
