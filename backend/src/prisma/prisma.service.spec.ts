import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { LoggerService } from '../logger/logger.service';
import { jest } from '@jest/globals';

describe('PrismaService', () => {
  let service: PrismaService;

  // Use jest.Mocked to get better intellisense on your mocks
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to the database on module init', async () => {
    // Note: spying on the prototype or the instance works, 
    // but ensure $connect exists on the service (PrismaClient)
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValueOnce(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Connected')
    );
  });

  it('should log error if connection fails', async () => {
    const error = new Error('DB connection failed');
    jest.spyOn(service, '$connect').mockRejectedValueOnce(error);

    await service.onModuleInit();

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(String),
      error
    );
  });

  it('should disconnect from the database on module destroy', async () => {
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValueOnce(undefined);

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Disconnected')
    );
  });
});