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
import { AuditTargetType, AuditAction, ActiveStatus, Prisma } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { AuthMailService } from '../mail/auth-mail.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
    private readonly authMailService: AuthMailService,
  ) { }

  async login(
    loginDto: LoginDto,
    requestInfo: { ip: string; userAgent: string | null; deviceInfo?: string; correlationId?: string },
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
          action: AuditAction.LOGIN_FAILURE,
          entity: 'USER',
          metadata: { email: loginDto.email, reason: 'Incorrect password' },
          ipAddress: requestInfo.ip,
          userAgent: requestInfo.userAgent || undefined,
          correlationId: requestInfo.correlationId,
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
        action: AuditAction.LOGIN_SUCCESS,
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent || undefined,
        correlationId: requestInfo.correlationId,
      });

      return { accessToken, refreshToken, user };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;

      await this.auditService.createLog({
        action: AuditAction.LOGIN_FAILURE,
        entity: 'USER',
        metadata: { email: loginDto.email, reason: err.message || 'Unknown failure' },
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent || undefined,
        correlationId: requestInfo.correlationId,
      });

      throw err;
    }
  }

  async refreshTokens(
    combinedToken: string,
    requestInfo: { ip: string; userAgent: string | null; deviceInfo?: string; correlationId?: string },
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
        correlationId: requestInfo.correlationId,
      });

      return { accessToken, refreshToken: newRefreshToken, user };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('An unexpected error occurred during token refresh');
    }
  }

  async logout(combinedToken: string, correlationId?: string) {
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
          action: AuditAction.LOGOUT,
          targetType: AuditTargetType.USER,
          targetId: record.userId,
          correlationId,
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto, correlationId?: string) {
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
          action: AuditAction.PASSWORD_CHANGE_FAILURE,
          metadata: { reason: 'Incorrect old password' },
          correlationId,
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
        action: AuditAction.PASSWORD_CHANGE_SUCCESS,
        metadata: { activated: user.status === ActiveStatus.PENDING },
        correlationId,
      });

      return { message };
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('An unexpected error occurred while changing password');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto, correlationId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // To prevent email enumeration, we return success even if the user doesn't exist
    if (!user) {
      return { message: 'If your email is in our system, you will receive a reset link shortly.' };
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    // Store hashed token and expiry (30 mins)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    // Send email (Queued)
    await this.authMailService.addPasswordResetEmailJob({
      name: user.firstName,
      email: user.email,
      resetToken: token,
    });

    await this.auditService.createLog({
      actorId: user.id,
      targetType: AuditTargetType.USER,
      targetId: user.id,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      correlationId,
    });

    return { message: 'If your email is in our system, you will receive a reset link shortly.' };
  }

  async resetPassword(dto: ResetPasswordDto, correlationId?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        passwordResetExpires: { gt: new Date() },
        passwordResetTokenHash: { not: null },
      },
    });

    let targetUser: any = null;
    for (const user of users) {
      if (user.passwordResetTokenHash && await bcrypt.compare(dto.token, user.passwordResetTokenHash)) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: targetUser.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpires: null,
        status: targetUser.status === ActiveStatus.PENDING ? ActiveStatus.ACTIVE : targetUser.status,
      },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: targetUser.id },
      data: { revokedAt: new Date() },
    });

    await this.auditService.createLog({
      actorId: targetUser.id,
      targetType: AuditTargetType.USER,
      targetId: targetUser.id,
      action: AuditAction.PASSWORD_RESET_SUCCESS,
      correlationId,
    });

    return { message: 'Password has been reset successfully. Please login with your new password.' };
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
    requestInfo: { ip: string; userAgent: string | null; deviceInfo?: string; correlationId?: string },
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
        correlationId: requestInfo.correlationId,
      },
    });

    return `${tokenRecord.id}.${plainToken}`;
  }
}
