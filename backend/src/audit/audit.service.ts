import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditTargetType, AuditAction, Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: {
    actorId?: string;
    targetType?: AuditTargetType;
    targetId?: string;
    action: AuditAction;
    entity?: string;
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    correlationId?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        targetType: data.targetType,
        targetId: data.targetId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        correlationId: data.correlationId,
      },
    });
  }
}
