import {
  jest,
  describe,
  beforeEach,
  it,
  expect,
  afterEach,
} from '@jest/globals';

const mockGenerateTempPassword = jest.fn<() => string>();
const mockHash = jest.fn<(data: string, rounds: number) => Promise<string>>();
const mockHandlePrismaUniqueError = jest.fn();

await jest.unstable_mockModule('../common/utils/password.util.js', () => ({
  generateTempPassword: mockGenerateTempPassword,
}));

await jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: mockHash,
    compare: jest.fn(),
  },
}));

await jest.unstable_mockModule('../prisma/prisma.helpers.js', () => ({
  handlePrismaUniqueError: mockHandlePrismaUniqueError,
}));

const { UsersService } = await import('./users.service.js');
const { PrismaService } = await import('../prisma/prisma.service.js');
const { ForbiddenException } = await import('@nestjs/common');
const { Role } = await import('@prisma/client');
const { Test } = await import('@nestjs/testing');

describe('UsersService', () => {
  let service: InstanceType<typeof UsersService>;
  let prisma: { user: { create: jest.Mock<any> } };

  beforeEach(async () => {
    prisma = {
      user: { create: jest.fn<any>() },
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ForbiddenException when creator role cannot create target role', async () => {
      const creator = { role: Role.ADMIN, id: 1 } as any;
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Role.SUPER_ADMIN,
      };

      await expect(service.create(dto, creator)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should hash the password', async () => {
      const creator = { role: Role.ADMIN, id: 1 } as any;
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Role.SECRETARY,
      };

      mockGenerateTempPassword.mockReturnValue('temppassword');
      mockHash.mockResolvedValue('hashedpassword');
      prisma.user.create.mockResolvedValue({ id: 1 });

      await service.create(dto, creator);

      expect(mockHash).toHaveBeenCalledWith('temppassword', 10);
    });

    it('should call prisma.user.create with hashed password and never plaintext', async () => {
      const creator = { role: Role.ADMIN, id: 1 } as any;
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Role.SECRETARY,
      };

      mockGenerateTempPassword.mockReturnValue('temppassword');
      mockHash.mockResolvedValue('hashedpassword');
      prisma.user.create.mockResolvedValue({ id: 1 });

      await service.create(dto, creator);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
          email: dto.email,
          passwordHash: 'hashedpassword',
        },
      });

      const callArg = (prisma.user.create as jest.Mock).mock.calls[0][0];
      expect(JSON.stringify(callArg)).not.toContain('temppassword');
    });

    it('should return the created user', async () => {
      const creator = { role: Role.ADMIN, id: 1 } as any;
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: Role.SECRETARY,
      };

      const createdUser = { id: 1, ...dto, passwordHash: 'hashedpassword' };

      mockGenerateTempPassword.mockReturnValue('temppassword');
      mockHash.mockResolvedValue('hashedpassword');
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.create(dto, creator);

      expect(result).toEqual(createdUser);
    });

    it('should call handlePrismaUniqueError when prisma throws a unique constraint error', async () => {
      const creator = { role: Role.ADMIN, id: 1 } as any;
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        role: Role.SECRETARY,
      };

      const prismaError = new Error('Unique constraint failed');
      mockGenerateTempPassword.mockReturnValue('temppassword');
      mockHash.mockResolvedValue('hashedpassword');
      prisma.user.create.mockRejectedValue(prismaError);

      await expect(service.create(dto, creator)).rejects.toThrow();

      expect(mockHandlePrismaUniqueError).toHaveBeenCalledWith(
        prismaError,
        'email',
      );
    });

    it('should send a welcome email', async () => {});
    it('should send the temp password email', async () => {});
  });
});
