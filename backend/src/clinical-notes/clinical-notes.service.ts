import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';
import { VisitsGateway } from '../visits/visits.gateway.js';
import { AuditAction, AuditTargetType, User } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClinicalNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
    private readonly visitsGateway: VisitsGateway,
  ) {}

  async create(dto: CreateClinicalNoteDto, actor: User) {
    // 1. Verify visit exists
    const visit = await this.prisma.visit.findFirst({
      where: { id: dto.visitId, deletedAt: null },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${dto.visitId} not found`);
    }

    // 2. Perform upsert with strict optimistic concurrency control
    const note = await this.prisma.$transaction(async (tx) => {
      const existingNote = await tx.clinicalNote.findUnique({
        where: { visitId: dto.visitId },
      });

      if (existingNote) {
        // If version is provided, check for conflict
        if (dto.version !== undefined && existingNote.version !== dto.version) {
          throw new ConflictException(
            'The clinical note has been updated by another session or process. Please refresh to get the latest version.',
          );
        }

        return tx.clinicalNote.update({
          where: { id: existingNote.id },
          data: {
            chiefComplaint: dto.chiefComplaint,
            content: dto.content,
            authorId: actor.id,
            version: { increment: 1 },
          },
        });
      } else {
        return tx.clinicalNote.create({
          data: {
            visitId: dto.visitId,
            authorId: actor.id,
            chiefComplaint: dto.chiefComplaint,
            content: dto.content,
            version: 0,
          },
        });
      }
    });

    // 3. Broadcast real-time update with version info
    this.visitsGateway.broadcastVisitUpdate(dto.visitId);

    // 4. Clinical audit
    await this.auditService
      .createLog({
        actorId: actor.id,
        action: AuditAction.CLINICAL_NOTE_ADDED,
        targetType: AuditTargetType.CLINICAL_NOTE,
        targetId: note.id,
        metadata: { visitId: dto.visitId, version: Number(note.version) },
      })
      .catch((err) =>
        this.logger.error(`Clinical audit failed: ${err.message}`),
      );

    return note;
  }

  async findByVisit(visitId: string) {
    // Return a single object (or null) instead of an array,
    // since we now enforce a 1:1 relationship
    return this.prisma.clinicalNote.findFirst({
      where: { visitId, deletedAt: null },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const note = await this.prisma.clinicalNote.findFirst({
      where: { id, deletedAt: null },
    });

    if (!note) {
      throw new NotFoundException(`Encounter note with ID ${id} not found`);
    }

    return note;
  }
}
