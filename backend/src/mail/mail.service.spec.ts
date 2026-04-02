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
        from: expect.any(String),
        to: ['user@example.com'],
        subject: expect.any(String),
        html: expect.stringContaining('tempPassword123'),
      });
    });

    it('should throw InternalServerErrorException when resend returns an error', async () => {
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
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
