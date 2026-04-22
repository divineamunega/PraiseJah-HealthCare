import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditTargetType, AuditAction, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto.js';
import { RoleCreationMap } from './constants/role.constants.js';
import { generateTempPassword } from '../common/utils/password.util.js';
import { handlePrismaUniqueError } from '../prisma/prisma.helpers.js';
import { WelcomeMailService } from '../mail/welcome-mail.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';


@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly welcomeMailService: WelcomeMailService,
    private readonly logger: LoggerService,
    private readonly auditService: AuditService,
  ) { }

  async create(dto: CreateUserDto, creator: User) {
    // 1. Making sure only allowed users can create users
    const allowedRoles = RoleCreationMap[creator.role];
    if (!allowedRoles.includes(dto.role)) {
      throw new ForbiddenException(
        `User with role ${creator.role} is not allowed to create ${dto.role}.`,
      );
    }

    // 2. Generate a random password and hash it
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 3. Create The user
    let user: User;
    try {
      user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
          email: dto.email,
          passwordHash,
          createdById: creator.id,
        },
      });
    } catch (err) {
      handlePrismaUniqueError(err, 'email');
      throw err;
    }

    // 4. Send the welcome and change password email
    this.welcomeMailService
      .addWelcomeEmailJob({
        email: user.email,
        name: user.firstName,
        tempPassword,
      })
      .catch(() => {
        this.logger.error(`Failed to queue welcome email for ${user.email}:`);
      });
    return user;
  }

  async findUniqueByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { email },
      });
      return user;
    } catch (err: any) {
      if (err.code === 'P2025') throw new UnauthorizedException("Incorrect email or password");
      this.logger.error(err)
      throw new InternalServerErrorException();
    }
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateStatus(id: string, status: any, actor: User) {
    const user = await this.findById(id);

    if (user.id === actor.id) {
      throw new BadRequestException('You cannot change your own status');
    }

    const oldStatus = user.status;
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status },
    });

    await this.auditService.createLog({
      actorId: actor.id,
      targetType: AuditTargetType.USER,
      targetId: id,
      action: AuditAction.USER_STATUS_UPDATED,
      metadata: {
        oldValue: oldStatus,
        newValue: status,
      },
    });

    return updatedUser;
  }

  async update(id: string, dto: Partial<CreateUserDto>, actor: User) {
    const user = await this.findById(id);
    
    // Filter out fields that should not be updated via this method or track changes
    const changes: Record<string, { old: any; new: any }> = {};
    
    for (const key in dto) {
      const newValue = dto[key];
      const oldValue = (user as any)[key];
      if (newValue !== oldValue) {
        changes[key] = { old: oldValue, new: newValue };
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    if (Object.keys(changes).length > 0) {
      await this.auditService.createLog({
        actorId: actor.id,
        targetType: AuditTargetType.USER,
        targetId: id,
        action: AuditAction.USER_UPDATED,
        metadata: {
          changes,
        },
      });
    }

    return updatedUser;
  }

  async remove(id: string, actor: User) {
    const user = await this.findById(id);
    if (user.id === actor.id) {
      throw new BadRequestException('You cannot delete yourself');
    }

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
