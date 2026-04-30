import {
  jest,
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
} from '@jest/globals';
import { InternalServerErrorException } from '@nestjs/common';

const mockSendMail = jest.fn<(options: any) => any>();

await jest.unstable_mockModule('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSendMail,
    },
  })),
}));

const { MailService } = await import('./mail.service.js');
const { Resend } = await import('resend');
const { Test } = await import('@nestjs/testing');
const { ConfigService } = await import('@nestjs/config');
const { LoggerService } = await import('../logger/logger.service.js');

describe('MailService', () => {
  let service: InstanceType<typeof MailService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: Resend,
          useValue: { emails: { send: mockSendMail } },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'EMAIL_FROM') return 'no-reply@praisejah.com';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcomeEmail', () => {
    it('should send a welcome email with the correct arguments', async () => {
      mockSendMail.mockResolvedValue({ data: {}, error: null });

      await service.sendWelcomeEmail(
        'divine',
        'user@example.com',
        'tempPassword123',
      );

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'no-reply@praisejah.com',
        to: ['user@example.com'],
        subject: expect.stringContaining('Welcome'),
        html: expect.stringContaining('tempPassword123'),
      });
    });

    it('should throw Error when resend returns an error', async () => {
      mockSendMail.mockResolvedValue({
        data: null,
        error: { message: 'An error occurred' },
      });

      await expect(
        service.sendWelcomeEmail(
          'divine',
          'user@example.com',
          'tempPassword123',
        ),
      ).rejects.toThrow(Error);
    });
  });
});
