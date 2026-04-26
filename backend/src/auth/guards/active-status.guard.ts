import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ActiveStatus } from '@prisma/client';

@Injectable()
export class ActiveStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // In case JwtAuthGuard was not applied before this guard
      return false;
    }

    if (user.status === ActiveStatus.ACTIVE) {
      return true;
    }

    if (user.status === ActiveStatus.PENDING) {
      throw new ForbiddenException(
        'Your account is pending activation. Please contact an administrator.',
      );
    }

    if (user.status === ActiveStatus.SUSPENDED) {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact an administrator.',
      );
    }

    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }
}
