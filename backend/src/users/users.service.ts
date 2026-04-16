import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditTargetType, User } from '@prisma/client';
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

  async create(dto: CreateUserDto, creator: User, correlationId?: string) {
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

    // 4. Log the action
    await this.auditService.createLog({
      actorId: creator.id,
      targetType: AuditTargetType.USER,
      targetId: user.id,
      action: 'USER_CREATED',
      metadata: { role: user.role, email: user.email },
      correlationId,
    });

    // 5. Send the welcome and change password email
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
}
