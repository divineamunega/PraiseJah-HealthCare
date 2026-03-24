import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@prisma/client';
import bcrypt from "bcrypt";
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateUserDto) {
    // 1. Check if the user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email Already Exists")
    }


    const passwordHash = bcrypt.hash(dto.password, 10);

    // 2. If user not exists create new user
    // const user = await this.prisma.user.create({ data: { email: data.email, firstName: data.firstName, lastName: data.lastName, } })
  }
}
