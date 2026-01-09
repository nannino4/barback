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
        this.logger.debug('PaymentService initialized', 'PaymentService#constructor');
    }

    async addPaymentMethod(userId: Types.ObjectId, paymentMethodId: string, requestId?: string): Promise<Stripe.PaymentMethod> 
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

        // Attach payment method to customer
        const paymentMethod = await this.stripeService.attachPaymentMethod(paymentMethodId, stripeCustomerId, requestId);

        this.logger.debug(`Payment method added successfully for user: ${userId}`, 'PaymentService#addPaymentMethod', requestId);
        return paymentMethod;
    }

    async getPaymentMethods(userId: Types.ObjectId, requestId?: string): Promise<Stripe.PaymentMethod[]> 
    {
        this.logger.debug(`Getting payment methods for user: ${userId}`, 'PaymentService#getPaymentMethods', requestId);
        
        const user = await this.userService.findById(userId, requestId);
        if (!user.stripeCustomerId) 
        {
            return [];
        }

        const paymentMethods = await this.stripeService.listPaymentMethods(user.stripeCustomerId, 'card', requestId);
        return paymentMethods;
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
