import { Prisma } from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

export function handlePrismaUniqueError(err: unknown, field: string) {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    if (Array.isArray(err.meta?.target) && err.meta.target.includes(field)) {
      throw new ForbiddenException(`${field} already exists`);
    }
  }
  throw err;
}
