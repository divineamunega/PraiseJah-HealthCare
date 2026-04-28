import { Test, TestingModule } from '@nestjs/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { LabOrderStatus, QueueStatus } from '@prisma/client';
import { LabOrdersService } from './lab-orders.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuditService } from '../audit/audit.service.js';
import { VisitsGateway } from '../visits/visits.gateway.js';

describe('LabOrdersService', () => {
  let service: LabOrdersService;

  const mockPrismaService = {
    labOrder: {
      findUnique: jest.fn<any>(),
    },
    visit: {
      findUnique: jest.fn<any>(),
    },
    $transaction: jest.fn<any>(),
  };

  const mockLoggerService = {
    error: jest.fn<any>(),
    warn: jest.fn<any>(),
    log: jest.fn<any>(),
  };

  const mockAuditService = {
    createLog: jest.fn<any>().mockResolvedValue({}),
  };

  const mockVisitsGateway = {
    broadcastQueueUpdate: jest.fn<any>(),
    broadcastVisitUpdate: jest.fn<any>(),
    broadcastLabResultsReady: jest.fn<any>(),
  };

  const tx = {
    labOrder: {
      update: jest.fn<any>(),
      count: jest.fn<any>(),
    },
    queueEntry: {
      update: jest.fn<any>(),
    },
  };

  beforeEach(async () => {
    mockPrismaService.$transaction.mockImplementation(
      async (callback: any) => callback(tx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabOrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: VisitsGateway, useValue: mockVisitsGateway },
      ],
    }).compile();

    service = module.get<LabOrdersService>(LabOrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('completeWithResults', () => {
    it('emits lab_results_ready with visit doctorId when present', async () => {
      mockPrismaService.labOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        visitId: 'visit-1',
        testName: 'FBC',
        visit: { doctorId: 'doctor-1' },
      });

      tx.labOrder.update.mockResolvedValue({
        id: 'order-1',
        status: LabOrderStatus.COMPLETED,
      });
      tx.labOrder.count.mockResolvedValue(1);

      await service.completeWithResults(
        'order-1',
        { hemoglobin: 13.5 },
        { id: 'lab-1' } as any,
      );

      expect(mockVisitsGateway.broadcastLabResultsReady).toHaveBeenCalledWith(
        'visit-1',
        'doctor-1',
      );
      expect(mockPrismaService.visit.findUnique).not.toHaveBeenCalled();
    });

    it('re-resolves doctorId and emits when initial order snapshot has no doctorId', async () => {
      mockPrismaService.labOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        visitId: 'visit-1',
        testName: 'FBC',
        visit: { doctorId: null },
      });

      tx.labOrder.update.mockResolvedValue({
        id: 'order-1',
        status: LabOrderStatus.COMPLETED,
      });
      tx.labOrder.count.mockResolvedValue(0);
      tx.queueEntry.update.mockResolvedValue({
        id: 'queue-1',
        status: QueueStatus.READY_FOR_DOCTOR,
      });

      mockPrismaService.visit.findUnique.mockResolvedValue({
        doctorId: 'doctor-2',
      });

      await service.completeWithResults(
        'order-1',
        { hemoglobin: 13.5 },
        { id: 'lab-1' } as any,
      );

      expect(mockPrismaService.visit.findUnique).toHaveBeenCalledWith({
        where: { id: 'visit-1' },
        select: { doctorId: true },
      });
      expect(mockVisitsGateway.broadcastLabResultsReady).toHaveBeenCalledWith(
        'visit-1',
        'doctor-2',
      );
    });

    it('logs a warning and does not throw when doctorId is still missing', async () => {
      mockPrismaService.labOrder.findUnique.mockResolvedValue({
        id: 'order-1',
        visitId: 'visit-1',
        testName: 'FBC',
        visit: { doctorId: null },
      });

      tx.labOrder.update.mockResolvedValue({
        id: 'order-1',
        status: LabOrderStatus.COMPLETED,
      });
      tx.labOrder.count.mockResolvedValue(1);
      mockPrismaService.visit.findUnique.mockResolvedValue({ doctorId: null });

      await expect(
        service.completeWithResults(
          'order-1',
          { hemoglobin: 13.5 },
          { id: 'lab-1' } as any,
        ),
      ).resolves.toEqual({
        id: 'order-1',
        status: LabOrderStatus.COMPLETED,
      });

      expect(mockVisitsGateway.broadcastLabResultsReady).not.toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'LAB_RESULTS_READY_NOTIFICATION_SKIPPED',
          orderId: 'order-1',
          visitId: 'visit-1',
          reason: 'doctorId_missing',
        }),
        'LabOrdersService',
      );
    });
  });
});
