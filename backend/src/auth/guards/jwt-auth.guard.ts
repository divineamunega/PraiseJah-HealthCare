import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import jwt from 'jsonwebtoken';

const { JsonWebTokenError, TokenExpiredError } = jwt;

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      } else if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token signature');
      } else if (info?.message === 'No auth token') {
        throw new UnauthorizedException('Authorization token is missing');
      }

      throw new UnauthorizedException(err?.message || info?.message || 'Authentication failed');
    }
    return user;
  }
}