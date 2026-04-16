import { SetMetadata } from '@nestjs/common';
import { AuditTargetType } from '@prisma/client';

export interface AuditOptions {
  action: string;
  targetType?: AuditTargetType;
}

export const AUDIT_METADATA_KEY = 'audit_metadata';

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_METADATA_KEY, options);
