import { Test, TestingModule } from '@nestjs/testing';
import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
  afterEach,
} from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { Role, VisitStatus } from '@prisma/client';
import { VisitsService } from './visits.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';
import { VisitsGateway } from './visits.gateway.js';

describe('VisitsService', () => {
  let service: VisitsService;

  const mockPrismaService = {
    visit: {
      findFirst: jest.fn<any>(),
      update: jest.fn<any>(),
    },
  };

  const mockLoggerService = {
    error: jest.fn<any>(),
    log: jest.fn<any>(),
  };

  const mockAuditService = {
    createLog: jest.fn<any>().mockResolvedValue({}),
  };

  const mockVisitsGateway = {
    broadcastQueueUpdate: jest.fn<any>(),
    broadcastVisitUpdate: jest.fn<any>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: VisitsGateway, useValue: mockVisitsGateway },
      ],
    }).compile();

    service = module.get<VisitsService>(VisitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('assigns doctorId to actor when doctor starts encounter', async () => {
      mockPrismaService.visit.findFirst.mockResolvedValue({
        id: 'visit-1',
        status: VisitStatus.CREATED,
        doctorId: null,
        deletedAt: null,
      });

      mockPrismaService.visit.update.mockResolvedValue({
        id: 'visit-1',
        status: VisitStatus.IN_PROGRESS,
        doctorId: 'doctor-1',
      });

      await service.update(
        'visit-1',
        { status: VisitStatus.IN_PROGRESS },
        { id: 'doctor-1', role: Role.DOCTOR } as any,
      );

      expect(mockPrismaService.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-1' },
        data: {
          status: VisitStatus.IN_PROGRESS,
          doctorId: 'doctor-1',
        },
      });
    });

    it('rejects doctor encounter start when doctorId does not match actor', async () => {
      mockPrismaService.visit.findFirst.mockResolvedValue({
        id: 'visit-1',
        status: VisitStatus.CREATED,
        doctorId: null,
        deletedAt: null,
      });

      await expect(
        service.update(
          'visit-1',
          { status: VisitStatus.IN_PROGRESS, doctorId: 'doctor-2' },
          { id: 'doctor-1', role: Role.DOCTOR } as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.visit.update).not.toHaveBeenCalled();
    });

    it('keeps nurse/secretary update behavior unchanged', async () => {
      mockPrismaService.visit.findFirst.mockResolvedValue({
        id: 'visit-1',
        status: VisitStatus.CREATED,
        doctorId: null,
        deletedAt: null,
      });

      mockPrismaService.visit.update.mockResolvedValue({
        id: 'visit-1',
        status: VisitStatus.IN_PROGRESS,
        doctorId: null,
      });

      await service.update(
        'visit-1',
        { status: VisitStatus.IN_PROGRESS },
        { id: 'nurse-1', role: Role.NURSE } as any,
      );

      expect(mockPrismaService.visit.update).toHaveBeenCalledWith({
        where: { id: 'visit-1' },
        data: {
          status: VisitStatus.IN_PROGRESS,
        },
      });
    });
  });
});
