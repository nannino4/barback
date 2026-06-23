import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Subscription, SubscriptionSchema, SubscriptionStatus } from './schemas/subscription.schema';
import { DatabaseTestHelper } from '../../test/utils/database.helper';
import { CustomLogger } from '../common/logger/custom.logger';
import { StripeService } from '../common/services/stripe.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

/**
 * Helper to create a mock Stripe subscription object with required billing details
 */
function createMockStripeSubscription(
    id: string,
    status: Stripe.Subscription.Status,
    options?: {
        interval?: 'month' | 'year';
        amount?: number;
        currentPeriodEnd?: number;
    }
): Partial<Stripe.Subscription>
{
    const interval = options?.interval ?? 'month';
    const amount = options?.amount ?? 1000;
    const currentPeriodEnd = options?.currentPeriodEnd ?? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

    return {
        id,
        status,
        items: {
            object: 'list',
            data: [
                {
                    id: `si_${id}`,
                    object: 'subscription_item',
                    current_period_end: currentPeriodEnd,
                    current_period_start: Math.floor(Date.now() / 1000),
                    price: {
                        id: `price_${id}`,
                        object: 'price',
                        unit_amount: amount,
                        recurring: {
                            interval,
                            interval_count: 1,
                        },
                    } as Stripe.Price,
                } as Stripe.SubscriptionItem,
            ],
            has_more: false,
            url: `/v1/subscription_items?subscription=${id}`,
        } as Stripe.ApiList<Stripe.SubscriptionItem>,
    };
}

describe('SubscriptionController - Integration Tests', () =>
{
    let app: INestApplication;
    let userService: UserService;
    let subscriptionService: SubscriptionService;
    let connection: Connection;
    let module: TestingModule;
    let mockLogger: jest.Mocked<CustomLogger>;
    let mockStripeService: jest.Mocked<StripeService>;
    let mockEmailService: jest.Mocked<EmailService>;

    let testUserId: Types.ObjectId;
    let testUser: User;

    beforeAll(async () =>
    {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
        } as any;

        mockStripeService = {
            createCustomer: jest.fn(),
            createSubscription: jest.fn(),
            cancelSubscription: jest.fn(),
            attachPaymentMethod: jest.fn(),
            setDefaultPaymentMethod: jest.fn(),
            updateSubscriptionDefaultPaymentMethod: jest.fn(),
            resumeSubscription: jest.fn(),
            retrieveSubscription: jest.fn(),
            getDefaultPaymentMethodId: jest.fn(),
            getSubscriptionPaymentMethod: jest.fn(),
            createResumeInvoicePreview: jest.fn(),
        } as any;

        mockEmailService = {
            sendEmail: jest.fn(),
            generateVerificationEmail: jest.fn(),
            generatePasswordResetEmail: jest.fn(),
        } as any;

        module = await Test.createTestingModule({
            imports: [
                DatabaseTestHelper.getMongooseTestModule(),
                MongooseModule.forFeature([
                    { name: User.name, schema: UserSchema },
                    { name: Subscription.name, schema: SubscriptionSchema },
                ]),
                JwtModule.register({}),
                ConfigModule.forRoot({
                    envFilePath: '.env.test',
                    isGlobal: true,
                }),
            ],
            controllers: [SubscriptionController],
            providers: [
                SubscriptionService,
                UserService,
                {
                    provide: CustomLogger,
                    useValue: mockLogger,
                },
                {
                    provide: StripeService,
                    useValue: mockStripeService,
                },
                {
                    provide: EmailService,
                    useValue: mockEmailService,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) =>
                        {
                            const config: Record<string, string> = {
                                JWT_ACCESS_TOKEN_SECRET: 'test-access-secret',
                                JWT_REFRESH_TOKEN_SECRET: 'test-refresh-secret',
                                JWT_ACCESS_TOKEN_EXPIRATION_TIME: '15m',
                                JWT_REFRESH_TOKEN_EXPIRATION_TIME: '7d',
                            };
                            return config[key];
                        }),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: () => true, // Will be overridden in beforeEach
            })
            .overrideGuard(EmailVerifiedGuard)
            .useValue({
                canActivate: () => true, // Will be overridden in tests
            })
            .compile();

        app = module.createNestApplication({
            logger: false,
        });
        app.setGlobalPrefix('api');
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        userService = module.get<UserService>(UserService);
        subscriptionService = module.get<SubscriptionService>(SubscriptionService);
        connection = module.get<Connection>(getConnectionToken());
    });

    beforeEach(async () =>
    {
        await DatabaseTestHelper.clearDatabase(connection);
        jest.clearAllMocks();

        // Create test user with hashed password and verified email
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        testUser = await userService.create({
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            hashedPassword,
            isEmailVerified: true,
        });
        testUserId = testUser._id as Types.ObjectId;

        // Override JwtAuthGuard to attach test user to request
        const jwtGuard = app.get(JwtAuthGuard);
        jest.spyOn(jwtGuard, 'canActivate').mockImplementation(async (context) =>
        {
            const request = context.switchToHttp().getRequest();
            const freshUser = await userService.findById(testUserId);
            request.user = freshUser;
            return true;
        });

        // Override EmailVerifiedGuard to check email verification
        const emailGuard = app.get(EmailVerifiedGuard);
        jest.spyOn(emailGuard, 'canActivate').mockImplementation((context) =>
        {
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            return user && user.isEmailVerified === true;
        });
    });

    afterAll(async () =>
    {
        await app.close();
        await module.close();
        await DatabaseTestHelper.stopInMemoryDatabase();
    });

    describe('/subscriptions/stripe/:stripeSubscriptionId (GET)', () =>
    {
        it('should return subscription status for owned subscription', async () =>
        {
            // Arrange - Create subscription for test user
            const stripeSubscriptionId = 'sub_test123';
            await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(stripeSubscriptionId, 'active') as Stripe.Subscription,
                testUserId
            );

            // Act
            const response = await request(app.getHttpServer())
                .get(`/api/subscriptions/stripe/${stripeSubscriptionId}`)
                .expect(200);

            // Assert - OutStripeSubscriptionStatusDto only exposes stripeSubscriptionId and status
            expect(response.body).toHaveProperty('stripeSubscriptionId', stripeSubscriptionId);
            expect(response.body).toHaveProperty('status', SubscriptionStatus.ACTIVE);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining(`Getting Stripe subscription status for user: ${testUserId}`),
                'SubscriptionController#getStripeSubscriptionStatus',
                undefined,
            );
        });

        it('should return 409 when user tries to access subscription they do not own', async () =>
        {
            // Arrange - Create another user and subscription
            const hashedPassword = await bcrypt.hash('Password123!', 10);
            const otherUser = await userService.create({
                email: 'other@example.com',
                firstName: 'Other',
                lastName: 'User',
                hashedPassword,
            });
            const otherUserId = otherUser._id as Types.ObjectId;

            const stripeSubscriptionId = 'sub_other123';
            await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(stripeSubscriptionId, 'active') as Stripe.Subscription,
                otherUserId
            );

            // Act & Assert
            const response = await request(app.getHttpServer())
                .get(`/api/subscriptions/stripe/${stripeSubscriptionId}`)
                .expect(409);

            // Verify error response
            expect(response.body).toHaveProperty('error', 'SUBSCRIPTION_OWNERSHIP_MISMATCH');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('does not belong to the current user');

            // Verify warning was logged
            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining(`User: ${testUserId} attempted to access subscription`),
                'SubscriptionController#getStripeSubscriptionStatus',
                undefined,
            );
        });

        it('should return 404 when subscription does not exist', async () =>
        {
            // Arrange
            const nonExistentSubscriptionId = 'sub_nonexistent';

            // Act & Assert
            const response = await request(app.getHttpServer())
                .get(`/api/subscriptions/stripe/${nonExistentSubscriptionId}`)
                .expect(404);

            // Verify error response
            expect(response.body).toHaveProperty('error', 'SUBSCRIPTION_NOT_FOUND');
            expect(response.body).toHaveProperty('message');
        });

        it('should return 403 when not authenticated', async () =>
        {
            // Arrange
            const stripeSubscriptionId = 'sub_test123';
            await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(stripeSubscriptionId, 'active') as Stripe.Subscription,
                testUserId
            );

            // Mock guards to deny access (no user attached)
            const jwtGuard = app.get(JwtAuthGuard);
            jest.spyOn(jwtGuard, 'canActivate').mockImplementation(async () =>
            {
                return false; // Simulate no authentication
            });

            // Act & Assert
            await request(app.getHttpServer())
                .get(`/api/subscriptions/stripe/${stripeSubscriptionId}`)
                .expect(403);
        });

        it('should return 403 when email is not verified', async () =>
        {
            // Arrange - Create unverified user
            const hashedPassword = await bcrypt.hash('Password123!', 10);
            const unverifiedUser = await userService.create({
                email: 'unverified@example.com',
                firstName: 'Unverified',
                lastName: 'User',
                hashedPassword,
                // isEmailVerified is false by default
            });
            const unverifiedUserId = unverifiedUser._id as Types.ObjectId;

            const stripeSubscriptionId = 'sub_test123';
            await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(stripeSubscriptionId, 'active') as Stripe.Subscription,
                unverifiedUserId
            );

            // Mock JWT guard to attach unverified user
            const jwtGuard = app.get(JwtAuthGuard);
            jest.spyOn(jwtGuard, 'canActivate').mockImplementation(async (context) =>
            {
                const request = context.switchToHttp().getRequest();
                request.user = unverifiedUser;
                return true;
            });

            // Email guard should now fail
            const emailGuard = app.get(EmailVerifiedGuard);
            jest.spyOn(emailGuard, 'canActivate').mockImplementation((context) =>
            {
                const request = context.switchToHttp().getRequest();
                const user = request.user;
                return user && user.isEmailVerified === true; // Will return false
            });

            // Act & Assert
            await request(app.getHttpServer())
                .get(`/api/subscriptions/stripe/${stripeSubscriptionId}`)
                .expect(403);
        });

        it('should handle different subscription statuses correctly', async () =>
        {
            // Arrange & Act & Assert for TRIALING
            const trialingSubId = 'sub_trialing';
            await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(trialingSubId, 'trialing') as Stripe.Subscription,
                testUserId
            );

            const trialingResponse = await request(app.getHttpServer())
                .get(`/api/subscriptions/stripe/${trialingSubId}`)
                .expect(200);

            expect(trialingResponse.body.status).toBe(SubscriptionStatus.TRIALING);

            // Arrange & Act & Assert for CANCELED
            const canceledSubId = 'sub_canceled';
            await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(canceledSubId, 'canceled') as Stripe.Subscription,
                testUserId
            );

            const canceledResponse = await request(app.getHttpServer())
                .get(`/api/subscriptions/stripe/${canceledSubId}`)
                .expect(200);

            expect(canceledResponse.body.status).toBe(SubscriptionStatus.CANCELED);

            // Arrange & Act & Assert for PAST_DUE
            const pastDueSubId = 'sub_past_due';
            await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(pastDueSubId, 'past_due') as Stripe.Subscription,
                testUserId
            );

            const pastDueResponse = await request(app.getHttpServer())
                .get(`/api/subscriptions/stripe/${pastDueSubId}`)
                .expect(200);

            expect(pastDueResponse.body.status).toBe(SubscriptionStatus.PAST_DUE);
        });
    });

    describe('/subscriptions/trial (POST)', () =>
    {
        it('activates a frictionless trial and persists a TRIALING subscription', async () =>
        {
            // Arrange - Stripe returns a trialing subscription, no payment collected
            const stripeSubscriptionId = 'sub_trial_friction';
            mockStripeService.createCustomer.mockResolvedValue({ id: 'cus_trial' } as Stripe.Customer);
            mockStripeService.createSubscription.mockResolvedValue(
                createMockStripeSubscription(stripeSubscriptionId, 'trialing', { interval: 'year' }) as Stripe.Subscription,
            );

            // Act
            const response = await request(app.getHttpServer())
                .post('/api/subscriptions/trial')
                .expect(201);

            // Assert - response and persisted state
            expect(response.body).toHaveProperty('stripeSubscriptionId', stripeSubscriptionId);
            expect(response.body).toHaveProperty('status', SubscriptionStatus.TRIALING);

            // No payment method collected for the trial
            expect(mockStripeService.createSubscription).toHaveBeenCalledWith(
                'cus_trial',
                expect.anything(),
                expect.objectContaining({ isTrial: true, collectPaymentMethod: false }),
                undefined,
            );

            // Local record created synchronously (query the DB, not internals)
            const stored = await subscriptionService.findByStripeSubscriptionId(stripeSubscriptionId);
            expect(stored.status).toBe(SubscriptionStatus.TRIALING);
            expect(stored.userId.toString()).toBe(testUserId.toString());
        });

        it('returns 409 when the user is not eligible for a trial', async () =>
        {
            // Arrange - user already has a subscription, so they are not eligible
            await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription('sub_existing', 'active') as Stripe.Subscription,
                testUserId,
            );

            // Act & Assert
            await request(app.getHttpServer())
                .post('/api/subscriptions/trial')
                .expect(409);

            expect(mockStripeService.createSubscription).not.toHaveBeenCalled();
        });
    });

    describe('/subscriptions/:id/payment-method (POST)', () =>
    {
        it('attaches a payment method and resumes a paused subscription', async () =>
        {
            // Arrange - a paused subscription owned by the test user
            const stripeSubscriptionId = 'sub_paused';
            const subscription = await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(stripeSubscriptionId, 'paused', { interval: 'year' }) as Stripe.Subscription,
                testUserId,
            );

            mockStripeService.createCustomer.mockResolvedValue({ id: 'cus_resume' } as Stripe.Customer);
            mockStripeService.attachPaymentMethod.mockResolvedValue({ id: 'pm_123' } as Stripe.PaymentMethod);
            mockStripeService.setDefaultPaymentMethod.mockResolvedValue({} as Stripe.Customer);
            mockStripeService.updateSubscriptionDefaultPaymentMethod.mockResolvedValue({} as Stripe.Subscription);
            mockStripeService.resumeSubscription.mockResolvedValue({} as Stripe.Subscription);
            // After adding payment + resuming, Stripe reports the sub as active
            mockStripeService.retrieveSubscription.mockResolvedValue(
                createMockStripeSubscription(stripeSubscriptionId, 'active', { interval: 'year' }) as Stripe.Subscription,
            );

            // Act
            const response = await request(app.getHttpServer())
                .post(`/api/subscriptions/${subscription._id}/payment-method`)
                .send({ paymentMethodId: 'pm_123' })
                .expect(201);

            // Assert - resume was triggered and local status synced to ACTIVE
            expect(mockStripeService.updateSubscriptionDefaultPaymentMethod).toHaveBeenCalledWith(
                stripeSubscriptionId,
                'pm_123',
                undefined,
            );
            expect(mockStripeService.resumeSubscription).toHaveBeenCalledWith(stripeSubscriptionId, undefined);
            expect(response.body).toHaveProperty('status', SubscriptionStatus.ACTIVE);

            const stored = await subscriptionService.findByStripeSubscriptionId(stripeSubscriptionId);
            expect(stored.status).toBe(SubscriptionStatus.ACTIVE);
        });

        it('does not resume when the subscription is still trialing', async () =>
        {
            // Arrange - a trialing subscription (adding a card should not resume)
            const stripeSubscriptionId = 'sub_trialing_addpm';
            const subscription = await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(stripeSubscriptionId, 'trialing', { interval: 'year' }) as Stripe.Subscription,
                testUserId,
            );

            mockStripeService.createCustomer.mockResolvedValue({ id: 'cus_trial_pm' } as Stripe.Customer);
            mockStripeService.attachPaymentMethod.mockResolvedValue({ id: 'pm_456' } as Stripe.PaymentMethod);
            mockStripeService.setDefaultPaymentMethod.mockResolvedValue({} as Stripe.Customer);
            mockStripeService.updateSubscriptionDefaultPaymentMethod.mockResolvedValue({} as Stripe.Subscription);
            mockStripeService.retrieveSubscription.mockResolvedValue(
                createMockStripeSubscription(stripeSubscriptionId, 'trialing', { interval: 'year' }) as Stripe.Subscription,
            );

            // Act
            await request(app.getHttpServer())
                .post(`/api/subscriptions/${subscription._id}/payment-method`)
                .send({ paymentMethodId: 'pm_456' })
                .expect(201);

            // Assert
            expect(mockStripeService.resumeSubscription).not.toHaveBeenCalled();
        });
    });

    describe('/subscriptions/:id/resume-preview (GET)', () =>
    {
        it('returns the amount due and recurring period for a paused subscription', async () =>
        {
            // Arrange
            const stripeSubscriptionId = 'sub_paused_preview';
            const subscription = await subscriptionService.createFromStripeSubscription(
                createMockStripeSubscription(stripeSubscriptionId, 'paused', { interval: 'year', amount: 1000 }) as Stripe.Subscription,
                testUserId,
            );
            mockStripeService.createResumeInvoicePreview.mockResolvedValue({
                amount_due: 1000,
                currency: 'eur',
            } as Stripe.Invoice);

            // Act
            const response = await request(app.getHttpServer())
                .get(`/api/subscriptions/${subscription._id}/resume-preview`)
                .expect(200);

            // Assert
            expect(response.body).toMatchObject({
                amountDue: 1000,
                currency: 'eur',
                recurringAmount: 1000,
                recurringCurrency: 'eur',
                billingInterval: 'YEARLY',
            });
            expect(mockStripeService.createResumeInvoicePreview).toHaveBeenCalledWith(stripeSubscriptionId, undefined);
        });
    });
});
