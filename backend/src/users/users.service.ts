import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto.js';
import { RoleCreationMap } from './constants/role.constants.js';
import { generateTempPassword } from '../common/utils/password.util.js';
import { handlePrismaUniqueError } from '../prisma/prisma.helpers.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateUserDto, creator: User) {


    // 1. Making sure only allowed users can create users
    const allowedRoles = RoleCreationMap[creator.role];
    if (!allowedRoles.includes(dto.role)) {
      throw new ForbiddenException(`User with role ${creator.role} is not allowed to create ${dto.role}.`)
    }

    // 2. Generate a random password and hash it
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 3. Create The user

    try {
      return await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
          email: dto.email,
          passwordHash,
        },
      });
    } catch (err) {
      handlePrismaUniqueError(err, 'email');
      throw err;
    }

    // 4. Send the welcome and change password email
  }
}
