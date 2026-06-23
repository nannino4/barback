import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { StripeService } from '../common/services/stripe.service';
import { CustomLogger } from '../common/logger/custom.logger';
import Stripe from 'stripe';

@Injectable()
export class PaymentService 
{
    constructor(
        private readonly userService: UserService,
        private readonly stripeService: StripeService,
        private readonly logger: CustomLogger,
    ) 
    {
        this.logger.log('PaymentService initialized', 'PaymentService#constructor');
    }

    /**
     * Create a SetupIntent so the client can collect and save a payment method.
     * Ensures the user has a Stripe customer first. Returns the clientSecret.
     */
    async createSetupIntent(userId: Types.ObjectId, requestId?: string): Promise<{ clientSecret: string }>
    {
        this.logger.debug(`Creating setup intent for user: ${userId}`, 'PaymentService#createSetupIntent', requestId);

        const user = await this.userService.findById(userId, requestId);
        let stripeCustomerId = user.stripeCustomerId;

        if (!stripeCustomerId)
        {
            const stripeCustomer = await this.stripeService.createCustomer(
                user.email,
                `${user.firstName} ${user.lastName}`,
                requestId,
            );
            stripeCustomerId = stripeCustomer.id;
            await this.userService.updateStripeCustomerId(userId, stripeCustomerId, requestId);
        }

        const setupIntent = await this.stripeService.createSetupIntent(stripeCustomerId, requestId);
        if (!setupIntent.client_secret)
        {
            throw new BadRequestException('Setup intent client secret not available');
        }

        this.logger.debug(`Setup intent created for user: ${userId}`, 'PaymentService#createSetupIntent', requestId);
        return { clientSecret: setupIntent.client_secret };
    }

    async addPaymentMethod(
        userId: Types.ObjectId,
        paymentMethodId: string,
        setAsDefault = false,
        requestId?: string,
    ): Promise<Stripe.PaymentMethod & { isDefault: boolean }>
    {
        this.logger.debug(`Adding payment method for user: ${userId}`, 'PaymentService#addPaymentMethod', requestId);
        
        const user = await this.userService.findById(userId, requestId);
        let stripeCustomerId = user.stripeCustomerId;

        // Create Stripe customer if it doesn't exist
        if (!stripeCustomerId) 
        {
            const stripeCustomer = await this.stripeService.createCustomer(
                user.email,
                `${user.firstName} ${user.lastName}`,
                requestId,
            );
            stripeCustomerId = stripeCustomer.id;
            await this.userService.updateStripeCustomerId(userId, stripeCustomerId, requestId);
        }

        // Attach payment method to customer. This is idempotent for payment methods
        // that were already attached by a confirmed SetupIntent.
        const paymentMethod = await this.stripeService.attachPaymentMethod(paymentMethodId, stripeCustomerId, requestId);
        const defaultPaymentMethodId = await this.stripeService.getDefaultPaymentMethodId(stripeCustomerId, requestId);

        const shouldSetDefault = setAsDefault || !defaultPaymentMethodId;
        if (shouldSetDefault)
        {
            await this.stripeService.setDefaultPaymentMethod(stripeCustomerId, paymentMethodId, requestId);
        }

        this.logger.debug(`Payment method added successfully for user: ${userId}`, 'PaymentService#addPaymentMethod', requestId);
        return Object.assign(paymentMethod, {
            isDefault: shouldSetDefault || paymentMethod.id === defaultPaymentMethodId,
        });
    }

    async getPaymentMethods(userId: Types.ObjectId, requestId?: string): Promise<Array<Stripe.PaymentMethod & { isDefault: boolean }>> 
    {
        this.logger.debug(`Getting payment methods for user: ${userId}`, 'PaymentService#getPaymentMethods', requestId);
        
        const user = await this.userService.findById(userId, requestId);
        if (!user.stripeCustomerId) 
        {
            return [];
        }

        const [paymentMethods, defaultPaymentMethodId] = await Promise.all([
            this.stripeService.listPaymentMethods(user.stripeCustomerId, 'card', requestId),
            this.stripeService.getDefaultPaymentMethodId(user.stripeCustomerId, requestId),
        ]);

        return paymentMethods.map((paymentMethod) => Object.assign(paymentMethod, {
            isDefault: paymentMethod.id === defaultPaymentMethodId,
        }));
    }

    async removePaymentMethod(userId: Types.ObjectId, paymentMethodId: string, requestId?: string): Promise<void> 
    {
        this.logger.debug(
            `Removing payment method ${paymentMethodId} for user: ${userId}`,
            'PaymentService#removePaymentMethod',
            requestId,
        );
        
        const user = await this.userService.findById(userId, requestId);
        if (!user.stripeCustomerId) 
        {
            throw new NotFoundException('Customer not found');
        }

        // Verify the payment method belongs to the user
        const paymentMethod = await this.stripeService.retrievePaymentMethod(paymentMethodId, requestId);
        if (paymentMethod.customer !== user.stripeCustomerId) 
        {
            throw new BadRequestException('Payment method does not belong to user');
        }

        await this.stripeService.detachPaymentMethod(paymentMethodId, requestId);
        this.logger.debug(`Payment method removed successfully for user: ${userId}`, 'PaymentService#removePaymentMethod', requestId);
    }

    async setDefaultPaymentMethod(userId: Types.ObjectId, paymentMethodId: string, requestId?: string): Promise<void> 
    {
        this.logger.debug(
            `Setting default payment method ${paymentMethodId} for user: ${userId}`,
            'PaymentService#setDefaultPaymentMethod',
            requestId,
        );
        
        const user = await this.userService.findById(userId, requestId);
        if (!user.stripeCustomerId) 
        {
            throw new NotFoundException('Customer not found');
        }

        // Verify the payment method belongs to the user
        const paymentMethod = await this.stripeService.retrievePaymentMethod(paymentMethodId, requestId);
        if (paymentMethod.customer !== user.stripeCustomerId) 
        {
            throw new BadRequestException('Payment method does not belong to user');
        }

        await this.stripeService.setDefaultPaymentMethod(user.stripeCustomerId, paymentMethodId, requestId);
        this.logger.debug(
            `Default payment method set successfully for user: ${userId}`,
            'PaymentService#setDefaultPaymentMethod',
            requestId,
        );
    }
}
