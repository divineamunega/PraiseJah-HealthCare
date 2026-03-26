import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  describe,
  beforeEach,
  it,
  expect,
  jest,
  afterEach
} from '@jest/globals';
import { handlePrismaUniqueError } from '../prisma/prisma.helpers';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCreationMap } from './constants/role.constants';
import { ForbiddenException } from '@nestjs/common';
import { generateTempPassword } from '../common/utils/password.util';
import bcrypt from "bcrypt";

jest.mock('bcrypt');
jest.mock('../common/utils/password.util');
jest.mock('../prisma/prisma.helpers');

const mockedBcryptHash = bcrypt.hash as any;
const mockedGenerateTempPassword = generateTempPassword as unknown as jest.Mock;

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      user: { create: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  describe("Create", function () {
    it("should throw Forbidden Exception when creator Role cannot create target role", async function () {
      const creator = { role: Role.ADMIN, id: 1 } as any;
      const dto = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        role: Role.SUPER_ADMIN,
      }
      await expect(service.create(dto, creator)).rejects.toThrow(ForbiddenException)
    })

    it("should hash the password", async function () {
      const creator = { role: Role.ADMIN, id: 1 } as any;
      const dto = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        role: Role.SECRETARY,
      };

      mockedGenerateTempPassword.mockReturnValue('temppassword')
      mockedBcryptHash.mockResolvedValue('hashedpassword');
      await service.create(dto, creator);
      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
    })
  })
  // it('should create a new user', async function () {
  //   const creator = { role: "ADMIN", id: 1 } as any;
  //   const dto = {
  //     firstName: 'John',
  //     lastName: 'Doe',
  //     email: "john.doe@example.com"
  //   };
  // });


  afterEach(function () {
    jest.clearAllMocks();
  });

});

