import { plainToInstance } from 'class-transformer';
import { OutPaymentMethodDto } from './out.payment-method.dto';
import { OutSubscriptionDto } from './out.subscription.dto';
import { OutSuccessMessageDto } from './out.success-message.dto';
import { SubscriptionStatus, BillingInterval } from '../schemas/subscription.schema';

describe('Subscription DTOs', () => 
{
    describe('OutPaymentMethodDto', () => 
    {
        describe('Field Exposure and Security', () => 
        {
            it('should only expose safe payment method fields', () => 
            {
                const paymentMethod = {
                    id: 'pm_1234567890',
                    type: 'card',
                    card: {
                        brand: 'visa',
                        last4: '4242',
                        exp_month: 12,
                        exp_year: 2025,
                        cvc: '123', // This should be excluded
                        number: '4242424242424242', // This should be excluded
                    },
                    isDefault: true,
                    customerId: 'cus_123456', // This should be excluded
                    stripeData: { metadata: 'secret' }, // This should be excluded
                    billingDetails: { // This should be excluded
                        address: '123 Secret St',
                        phone: '+1234567890',
                    },
                };

                const transformed = plainToInstance(OutPaymentMethodDto, paymentMethod, {
                    excludeExtraneousValues: true,
                }) as OutPaymentMethodDto;

                // Should include only exposed fields
                expect(transformed.id).toBe(paymentMethod.id);
                expect(transformed.type).toBe(paymentMethod.type);
                expect(transformed.card?.brand).toBe(paymentMethod.card.brand);
                expect(transformed.card?.last4).toBe(paymentMethod.card.last4);
                expect(transformed.card?.expMonth).toBe(paymentMethod.card.exp_month);
                expect(transformed.card?.expYear).toBe(paymentMethod.card.exp_year);
                expect(transformed.isDefault).toBe(paymentMethod.isDefault);

                // Should exclude sensitive fields
                expect((transformed.card as any)?.cvc).toBeUndefined();
                expect((transformed.card as any)?.number).toBeUndefined();
                expect((transformed as any).customerId).toBeUndefined();
                expect((transformed as any).stripeData).toBeUndefined();
                expect((transformed as any).billingDetails).toBeUndefined();
            });

            it('should handle non-card payment methods', () => 
            {
                const bankAccountPayment = {
                    id: 'pm_bank_123',
                    type: 'bank_account',
                    card: null,
                    isDefault: false,
                    bankAccount: { // This should be excluded
                        routingNumber: '123456789',
                        accountNumber: '987654321',
                    },
                };

                const transformed = plainToInstance(OutPaymentMethodDto, bankAccountPayment, {
                    excludeExtraneousValues: true,
                }) as OutPaymentMethodDto;

                expect(transformed.id).toBe(bankAccountPayment.id);
                expect(transformed.type).toBe(bankAccountPayment.type);
                expect(transformed.isDefault).toBe(bankAccountPayment.isDefault);
                expect(transformed.card).toBeUndefined(); // Transform returns undefined when no card
                expect((transformed as any).bankAccount).toBeUndefined();
            });
        });

        describe('Card Data Transformation', () => 
        {
            it('should properly transform card data with @Transform decorator', () => 
            {
                const paymentMethodWithExtraCardData = {
                    id: 'pm_1234567890',
                    type: 'card',
                    card: {
                        brand: 'mastercard',
                        last4: '5555',
                        exp_month: 6,
                        exp_year: 2026,
                        cvc: '456',
                        funding: 'credit',
                        country: 'US',
                        fingerprint: 'secret_fingerprint',
                    },
                    isDefault: true,
                };

                const transformed = plainToInstance(OutPaymentMethodDto, paymentMethodWithExtraCardData, {
                    excludeExtraneousValues: true,
                }) as OutPaymentMethodDto;

                // Should only include the allowed card fields
                expect(transformed.card).toEqual({
                    brand: 'mastercard',
                    last4: '5555',
                    expMonth: 6,
                    expYear: 2026,
                });

                // Should exclude extra card data
                expect((transformed.card as any)?.funding).toBeUndefined();
                expect((transformed.card as any)?.country).toBeUndefined();
                expect((transformed.card as any)?.fingerprint).toBeUndefined();
            });

            it('should handle missing card data gracefully', () => 
            {
                const paymentMethodWithoutCard = {
                    id: 'pm_1234567890',
                    type: 'sepa_debit',
                    card: undefined,
                    isDefault: false,
                };

                const transformed = plainToInstance(OutPaymentMethodDto, paymentMethodWithoutCard, {
                    excludeExtraneousValues: true,
                }) as OutPaymentMethodDto;

                expect(transformed.card).toBeUndefined();
            });
        });
    });

    describe('OutSuccessMessageDto', () => 
    {
        describe('Constructor and Field Assignment', () => 
        {
            it('should create instance with success message', () => 
            {
                const successDto = new OutSuccessMessageDto('Operation completed successfully');

                expect(successDto.message).toBe('Operation completed successfully');
                expect(successDto.success).toBe(true);
            });

            it('should transform using plainToInstance', () => 
            {
                const rawData = {
                    message: 'Payment processed',
                    success: true,
                    timestamp: new Date(), // This should be excluded
                    internalCode: 'PAY_001', // This should be excluded
                };

                const transformed = plainToInstance(OutSuccessMessageDto, rawData, {
                    excludeExtraneousValues: true,
                }) as OutSuccessMessageDto;

                expect(transformed.message).toBe('Payment processed');
                expect(transformed.success).toBe(true);
                expect((transformed as any).timestamp).toBeUndefined();
                expect((transformed as any).internalCode).toBeUndefined();
            });
        });
    });

    describe('OutSubscriptionDto Integration', () => 
    {
        it('should expose all required subscription fields', () => 
        {
            const subscription = {
                _id: 'sub_123',
                id: 'sub_123',
                userId: 'user_456', // Should be excluded
                status: SubscriptionStatus.ACTIVE,
                autoRenew: true,
                billingInterval: BillingInterval.MONTHLY,
                nextBillingDate: new Date('2025-02-01'),
                amount: 1000,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-15'),
                stripeSubscriptionId: 'stripe_sub_789', // Should be excluded
                internalNotes: 'Created via API', // Should be excluded
            };

            const transformed = plainToInstance(OutSubscriptionDto, subscription, {
                excludeExtraneousValues: true,
            }) as OutSubscriptionDto;

            // Should include exposed fields
            expect(transformed.id).toBe('sub_123');
            expect(transformed.status).toBe(SubscriptionStatus.ACTIVE);
            expect(transformed.autoRenew).toBe(true);
            expect(transformed.billingInterval).toBe(BillingInterval.MONTHLY);
            expect(transformed.nextBillingDate).toEqual(new Date('2025-02-01'));
            expect(transformed.amount).toBe(1000);
            expect(transformed.createdAt).toEqual(new Date('2025-01-01'));
            expect(transformed.updatedAt).toEqual(new Date('2025-01-15'));
            
            // Should exclude sensitive/internal fields
            expect((transformed as any).userId).toBeUndefined();
            expect((transformed as any).stripeSubscriptionId).toBeUndefined();
            expect((transformed as any).internalNotes).toBeUndefined();
        });

        it('should handle yearly billing interval', () => 
        {
            const subscription = {
                _id: 'sub_yearly_123',
                id: 'sub_yearly_123',
                status: SubscriptionStatus.TRIALING,
                autoRenew: true,
                billingInterval: BillingInterval.YEARLY,
                nextBillingDate: new Date('2026-01-01'),
                amount: 10000,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-01'),
            };

            const transformed = plainToInstance(OutSubscriptionDto, subscription, {
                excludeExtraneousValues: true,
            }) as OutSubscriptionDto;

            expect(transformed.billingInterval).toBe(BillingInterval.YEARLY);
            expect(transformed.amount).toBe(10000);
        });

        it('should handle null nextBillingDate and amount', () => 
        {
            const subscription = {
                _id: 'sub_canceled_123',
                id: 'sub_canceled_123',
                status: SubscriptionStatus.CANCELED,
                autoRenew: false,
                billingInterval: BillingInterval.MONTHLY,
                nextBillingDate: null,
                amount: null,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date('2025-01-15'),
            };

            const transformed = plainToInstance(OutSubscriptionDto, subscription, {
                excludeExtraneousValues: true,
            }) as OutSubscriptionDto;

            expect(transformed.status).toBe(SubscriptionStatus.CANCELED);
            expect(transformed.nextBillingDate).toBeNull();
            expect(transformed.amount).toBeNull();
        });
    });
});
