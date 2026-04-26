import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../audit.service.js';
import {
  AUDIT_METADATA_KEY,
  AuditOptions,
} from '../decorators/audit.decorator.js';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<AuditOptions>(
      AUDIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, ip, headers, correlationId } = request;
    const userAgent = headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Log success
          this.auditService
            .createLog({
              actorId: user?.id,
              action: auditOptions.action,
              targetType: auditOptions.targetType,
              // Try to find an ID in the response or request params
              targetId: data?.id || request.params?.id,
              ipAddress: ip,
              userAgent,
              correlationId,
              metadata: {
                status: 'SUCCESS',
                // Avoid logging large sensitive objects, just keys or specific fields
                responseSummary: data?.id ? { id: data.id } : undefined,
              },
            })
            .catch((err) => console.error('Audit log failed:', err));
        },
        error: (error) => {
          // Log failure
          this.auditService
            .createLog({
              actorId: user?.id,
              action: `${auditOptions.action}_FAILURE` as AuditAction,
              targetType: auditOptions.targetType,
              targetId: request.params?.id,
              ipAddress: ip,
              userAgent,
              correlationId,
              metadata: {
                status: 'FAILURE',
                error: error.message,
              },
            })
            .catch((err) => console.error('Audit log failed:', err));
        },
      }),
    );
  }
}
