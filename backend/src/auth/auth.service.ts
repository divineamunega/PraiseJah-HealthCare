import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import ms from 'ms';
import LoginDto from './dto/login.dto.js';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service.js';
import { AuditTargetType, ActiveStatus } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
  ) { }

  async login(
    loginDto: LoginDto,
    requestInfo: { ip: string; userAgent: string | null; deviceInfo?: string },
  ) {
    try {
      // 1. look for user in the database
      const user = await this.userService.findUniqueByEmail(loginDto.email);

      // 2. compare the passed password to the hashed database password
      const isCorrect = await bcrypt.compare(
        loginDto.password,
        user.passwordHash,
      );

      // 3. throw an error if the password is incorrect
      if (!isCorrect) {
        await this.auditService.createLog({
          action: 'LOGIN_FAILURE',
          entity: 'USER',
          metadata: { email: loginDto.email, reason: 'Incorrect password' },
          ipAddress: requestInfo.ip,
          userAgent: requestInfo.userAgent || undefined,
        });
        throw new UnauthorizedException("Incorrect email or password");
      }

      // 4. Generate tokens using helpers
      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateAndStoreRefreshToken(user, requestInfo);

      // 6. Log successful login
      await this.auditService.createLog({
        actorId: user.id,
        targetType: AuditTargetType.USER,
        targetId: user.id,
        action: 'LOGIN_SUCCESS',
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent || undefined,
      });

      return { accessToken, refreshToken, user };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;

      await this.auditService.createLog({
        action: 'LOGIN_FAILURE',
        entity: 'USER',
        metadata: { email: loginDto.email, reason: err.message || 'Unknown failure' },
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent || undefined,
      });

      throw err;
    }
  }

  async refreshTokens(
    combinedToken: string,
    requestInfo: { ip: string; userAgent: string | null; deviceInfo?: string },
  ) {
    try {
      const [id, plainToken] = combinedToken.split('.');
      if (!id || !plainToken) {
        throw new UnauthorizedException('Invalid refresh token format');
      }

      const record = await this.prisma.refreshToken.findFirst({
        where: {
          id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!record) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const isMatch = await bcrypt.compare(plainToken, record.tokenHash);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = record.user;

      // 2. Revoke the old token (Rotation)
      await this.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      });

      // 3. Generate new pair using helpers
      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = await this.generateAndStoreRefreshToken(user, {
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent || record.userAgent,
        deviceInfo: requestInfo.deviceInfo || record.deviceInfo || undefined,
      });

      return { accessToken, refreshToken: newRefreshToken, user };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('An unexpected error occurred during token refresh');
    }
  }

  async logout(combinedToken: string) {
    try {
      const [id, plainToken] = combinedToken.split('.');
      if (!id || !plainToken) return;

      const record = await this.prisma.refreshToken.findFirst({
        where: { id, revokedAt: null },
      });

      if (!record) return;

      const isMatch = await bcrypt.compare(plainToken, record.tokenHash);
      if (isMatch) {
        await this.prisma.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() },
        });

        await this.auditService.createLog({
          actorId: record.userId,
          action: 'LOGOUT',
          targetType: AuditTargetType.USER,
          targetId: record.userId,
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      // 1. Verify confirm password matches
      if (dto.newPassword !== dto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      // 2. Fetch user
      const user = await this.userService.findById(userId);

      // 3. Verify old password
      const isCorrect = await bcrypt.compare(dto.oldPassword, user.passwordHash);
      if (!isCorrect) {
        await this.auditService.createLog({
          actorId: userId,
          targetType: AuditTargetType.USER,
          targetId: userId,
          action: 'PASSWORD_CHANGE_FAILURE',
          metadata: { reason: 'Incorrect old password' },
        });
        throw new BadRequestException('Incorrect old password');
      }

      // 4. Hash new password
      const passwordHash = await bcrypt.hash(dto.newPassword, 10);

      // 5. Determine new status and message
      let newStatus = user.status;
      let message = 'Password changed successfully';

      if (user.status === ActiveStatus.PENDING) {
        newStatus = ActiveStatus.ACTIVE;
        message = 'Password changed and account activated successfully';
      }

      // 6. Update user
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          status: newStatus,
        },
      });

      // 7. Log success
      await this.auditService.createLog({
        actorId: userId,
        targetType: AuditTargetType.USER,
        targetId: userId,
        action: 'PASSWORD_CHANGE_SUCCESS',
        metadata: { activated: user.status === ActiveStatus.PENDING },
      });

      return { message };
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('An unexpected error occurred while changing password');
    }
  }

  private generateAccessToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    return this.jwtService.sign(payload);
  }

  private async generateAndStoreRefreshToken(
    user: any,
    requestInfo: { ip: string; userAgent: string | null; deviceInfo?: string },
  ): Promise<string> {
    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(plainToken, 10);

    const tokenRecord = await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(
          ms(this.config.getOrThrow('REFRESH_EXPIRES_IN')) + Date.now(),
        ),
        ipAddress: requestInfo.ip,
        deviceInfo: requestInfo.deviceInfo || null,
        userAgent: requestInfo.userAgent || null,
      },
    });

    return `${tokenRecord.id}.${plainToken}`;
  }
}
