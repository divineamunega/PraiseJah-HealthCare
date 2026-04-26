import { Prisma } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

export function handlePrismaUniqueError(err: unknown, field: string) {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    if (
      (err?.meta?.driverAdapterError as any)?.cause.constraint.fields.includes(
        field,
      )
    ) {
      throw new ConflictException(`${field} already exists`);
    }

    throw new BadRequestException(
      `Unique constraint failed on field: ${field}`,
    );
  }
  throw err;
}
