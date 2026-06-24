import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { CustomLogger } from '../common/logger/custom.logger';
import * as nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { UserLanguage } from 'src/user/schemas/user.schema';

// Mock nodemailer
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

const mockSesSend = jest.fn();
jest.mock('@aws-sdk/client-ses', () => ({
    SESClient: jest.fn().mockImplementation(() => ({ send: mockSesSend })),
    SendEmailCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

describe('EmailService', () =>
{
    let service: EmailService;
    let mockTransporter: jest.Mocked<any>;
    let mockLogger: jest.Mocked<CustomLogger>;

    beforeEach(async () =>
    {
        mockTransporter = {
            sendMail: jest.fn(),
        };

        mockedNodemailer.createTransport.mockReturnValue(mockTransporter);
        mockedNodemailer.getTestMessageUrl.mockReturnValue('https://ethereal.email/message/test');
        mockSesSend.mockReset();
        jest.mocked(SESClient).mockClear();
        jest.mocked(SendEmailCommand).mockClear();

        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
        } as any;

        const mockConfigService = {
            get: jest.fn((key: string) =>
            {
                switch (key)
                {
                case 'SMTP_HOST':
                    return 'smtp.ethereal.email';
                case 'SMTP_PORT':
                    return 587;
                case 'SMTP_USER':
                    return 'test@ethereal.email';
                case 'SMTP_PASS':
                    return 'testpass';
                case 'EMAIL_FROM':
                    return 'noreply@barback.it';
                case 'FRONTEND_URL':
                    return 'http://localhost:3001';
                default:
                    return undefined;
                }
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: CustomLogger,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
    });

    afterEach(() =>
    {
        jest.clearAllMocks();
    });

    it('should be defined', () =>
    {
        expect(service).toBeDefined();
    });

    describe('sendEmail', () =>
    {
        it('should send email successfully', async () =>
        {
            const emailOptions = {
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test content',
                html: '<p>Test content</p>',
            };

            mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

            await service.sendEmail(emailOptions);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: 'noreply@barback.it',
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test content',
                html: '<p>Test content</p>',
            });
        });

        it('should throw error when transporter fails', async () =>
        {
            const emailOptions = {
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test content',
            };

            mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

            await expect(service.sendEmail(emailOptions)).rejects.toThrow('Failed to send email');
        });

        it('should send email with SES API when configured', async () =>
        {
            const mockSesConfigService = {
                get: jest.fn((key: string) =>
                {
                    switch (key)
                    {
                    case 'EMAIL_TRANSPORT':
                        return 'ses';
                    case 'SES_REGION':
                        return 'eu-south-1';
                    case 'SES_ACCESS_KEY_ID':
                        return 'test-access-key';
                    case 'SES_SECRET_ACCESS_KEY':
                        return 'test-secret-key';
                    case 'EMAIL_FROM':
                        return 'noreply@barback.it';
                    case 'FRONTEND_URL':
                        return 'http://localhost:3001';
                    default:
                        return undefined;
                    }
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    EmailService,
                    {
                        provide: ConfigService,
                        useValue: mockSesConfigService,
                    },
                    {
                        provide: CustomLogger,
                        useValue: mockLogger,
                    },
                ],
            }).compile();

            const sesService = module.get<EmailService>(EmailService);
            mockSesSend.mockResolvedValue({ MessageId: 'ses-message-id' });

            await sesService.sendEmail({
                to: 'test@example.com',
                subject: 'Test Subject',
                text: 'Test content',
                html: '<p>Test content</p>',
            });

            expect(SESClient).toHaveBeenCalledWith({
                region: 'eu-south-1',
                credentials: {
                    accessKeyId: 'test-access-key',
                    secretAccessKey: 'test-secret-key',
                },
            });
            expect(SendEmailCommand).toHaveBeenCalledWith(expect.objectContaining({
                Source: 'noreply@barback.it',
                Destination: {
                    ToAddresses: ['test@example.com'],
                },
            }));
            expect(mockSesSend).toHaveBeenCalledTimes(1);
        });
    });

    describe('generateVerificationEmail', () =>
    {
        it('should generate verification email options', () =>
        {
            const email = 'user@example.com';
            const token = 'verification-token';

            const result = service.generateVerificationEmail(email, token, UserLanguage.IT);

            expect(result.to).toBe(email);
            expect(result.subject).toBe('Verifica il tuo account Barback');
            expect(result.text).toContain('http://localhost:3001/auth/verify-email?token=verification-token');
            expect(result.html).toContain('http://localhost:3001/auth/verify-email?token=verification-token');
        });
    });

    describe('generatePasswordResetEmail', () =>
    {
        it('should generate password reset email options', () =>
        {
            const email = 'user@example.com';
            const token = 'reset-token';

            const result = service.generatePasswordResetEmail(email, token, UserLanguage.IT);

            expect(result.to).toBe(email);
            expect(result.subject).toBe('Reimposta la password Barback');
            expect(result.text).toContain('http://localhost:3001/auth/reset-password?token=reset-token');
            expect(result.html).toContain('http://localhost:3001/auth/reset-password?token=reset-token');
        });
    });
});
