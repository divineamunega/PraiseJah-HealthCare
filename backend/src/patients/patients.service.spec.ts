import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';
import { Sex } from '@prisma/client';
import { PatientSortBy } from './dto/patient-query.dto.js';
import { SortOrder } from '../common/dto/pagination.dto.js';

describe('PatientsService', () => {
  let service: PatientsService;
  let prisma: any;

  const mockPrismaService = {
    patient: {
      create: jest.fn<any>(),
      findMany: jest.fn<any>(),
      findUnique: jest.fn<any>(),
      update: jest.fn<any>(),
      count: jest.fn<any>(),
    },
  };

  const mockLoggerService = {
    error: jest.fn<any>(),
    log: jest.fn<any>(),
  };

  const mockAuditService = {
    createLog: jest.fn<any>().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        sex: Sex.MALE,
      };
      const expectedPatient = {
        id: '1',
        ...dto,
        dateOfBirth: new Date(dto.dateOfBirth),
      };
      mockPrismaService.patient.create.mockResolvedValue(expectedPatient);

      const result = await service.create(dto);

      expect(result).toEqual(expectedPatient);
      expect(mockPrismaService.patient.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          dateOfBirth: new Date(dto.dateOfBirth),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated and sorted patients', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
        sortBy: PatientSortBy.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };
      const patients = [{ id: '1', firstName: 'John' }];
      mockPrismaService.patient.findMany.mockResolvedValue(patients);
      mockPrismaService.patient.count.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result.data).toEqual(patients);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        lastPage: 1,
      });
      expect(mockPrismaService.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a patient if found', async () => {
      const patient = { id: '1', firstName: 'John', deletedAt: null };
      mockPrismaService.patient.findUnique.mockResolvedValue(patient);

      const result = await service.findOne('1');

      expect(result).toEqual(patient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(
        'Patient with ID 1 not found',
      );
    });

    it('should throw NotFoundException if patient is soft-deleted', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue({
        id: '1',
        deletedAt: new Date(),
      });

      await expect(service.findOne('1')).rejects.toThrow(
        'Patient with ID 1 not found',
      );
    });
  });
});
