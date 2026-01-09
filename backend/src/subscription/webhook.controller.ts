import { Controller, Post, RawBodyRequest, Req, Headers, BadRequestException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { StripeService } from '../common/services/stripe.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus } from './schemas/subscription.schema';
import Stripe from 'stripe';
import { CustomLogger } from '../common/logger/custom.logger';
import { Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { RequestId } from '../common/decorators/request-id.decorator';

@Controller('webhooks')
export class WebhookController 
{
    private readonly webhookSecret: string;

    /**
     * Handles Stripe webhook events for subscription lifecycle management
     * 
     * Key events:
     * - `customer.subscription.created`: Creates local subscription with INCOMPLETE status
     *   This happens immediately when Stripe subscription is created, before payment succeeds
     * - `customer.subscription.updated`: Syncs status changes (INCOMPLETE → ACTIVE/TRIALING)
     * - `customer.subscription.deleted`: Marks subscription as CANCELED
     * - `invoice.payment_failed`: Logs payment failures
     */
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly stripeService: StripeService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly logger: CustomLogger,
    ) 
    {
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) 
        {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }
        this.webhookSecret = webhookSecret;
    }

    @Post('stripe')
    async handleStripeWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
        @RequestId() requestId?: string,
    ): Promise<{ received: boolean }> 
    {
        this.logger.debug('Received Stripe webhook', 'WebhookController#handleStripeWebhook', requestId);

        if (!signature) 
        {
            throw new BadRequestException('Missing stripe-signature header');
        }

        let event: Stripe.Event;

        try 
        {
            event = this.stripeService.constructWebhookEvent(req.rawBody!, signature, this.webhookSecret, requestId);
        } 
        catch (err) 
        {
            this.logger.error(`Webhook signature verification failed: ${err}`, undefined, 'WebhookController#handleStripeWebhook', requestId);
            throw new BadRequestException('Webhook signature verification failed');
        }
        this.logger.debug(`Handling webhook event: ${event.type}`, 'WebhookController#handleStripeWebhook', requestId);
        switch (event.type) 
        {
        case 'customer.subscription.created':
        {
            // Creates local subscription when Stripe subscription is created
            // Initial status is typically INCOMPLETE (payment not yet processed)
            // Organization can be created immediately after this - no need to wait for ACTIVE
            this.logger.debug(`Processing customer.subscription.created event with id: ${event.id}`, 'WebhookController#handleStripeWebhook');
            const subscriptionData = event.data.object as Stripe.Subscription;
            const subscriptionResult = await this.getStripeSubscriptionAndUser(
                subscriptionData,
                'WebhookController#handleStripeWebhook',
                requestId,
            );

            if (!subscriptionResult) 
            {
                break;
            }

            const { stripeSubscription, user } = subscriptionResult;

            await this.subscriptionService.createFromStripeSubscription(
                stripeSubscription,
                user._id as Types.ObjectId,
                requestId,
            );
            
            this.logger.debug(
                `Local subscription created for Stripe subscription ${stripeSubscription.id}`,
                'WebhookController#handleStripeWebhook',
                requestId,
            );
            break;
        }
        case 'customer.subscription.updated':
        {
            // Syncs subscription status changes from Stripe
            // INCOMPLETE → ACTIVE: Payment succeeded
            // INCOMPLETE → TRIALING: Trial subscription confirmed
            // Also updates billing details (interval, next billing date, amount)
            this.logger.debug(`Processing customer.subscription.updated event with id: ${event.id}`, 'WebhookController#handleStripeWebhook');
            
            const stripeSubscription = event.data.object as Stripe.Subscription;
            await this.subscriptionService.syncSubscriptionFromStripe(stripeSubscription, requestId);
            this.logger.debug(
                `Local subscription synced from Stripe subscription ${stripeSubscription.id} with status ${stripeSubscription.status}`,
                'WebhookController#handleStripeWebhook',
                requestId,
            );
            break;
        }
        case 'customer.subscription.deleted':
        {
            const stripeSubscription = event.data.object as Stripe.Subscription;
            await this.subscriptionService.updateStatus(stripeSubscription.id, SubscriptionStatus.CANCELED, requestId);
            break;
        }
        case 'invoice.payment_failed':
        {
            // just log payment failure
            const invoice = event.data.object as Stripe.Invoice;
            if ((invoice as any).subscription) 
            {
                this.logger.warn(`Payment failed for subscription: ${(invoice as any).subscription}`, 'WebhookController#handleStripeWebhook', requestId);
            }
            break;
        }
        default:
            this.logger.debug(`Unhandled webhook event type: ${event.type}`, 'WebhookController#handleStripeWebhook', requestId);
        }

        return { received: true };
    }

    private async getStripeSubscriptionAndUser(
        subscriptionData: string | Stripe.Subscription | null | undefined,
        logContext: string,
        requestId?: string,
    ): Promise<{ stripeSubscription: Stripe.Subscription; user: User } | null> 
    {
        const subscriptionId = typeof subscriptionData === 'string'
            ? subscriptionData
            : subscriptionData?.id;

        if (!subscriptionId) 
        {
            this.logger.error('No subscription ID found in event data', undefined, logContext, requestId);
            return null;
        }

        const stripeSubscription = await this.stripeService.retrieveSubscription(subscriptionId, requestId);
        const customerData = stripeSubscription.customer;
        const customerId = typeof customerData === 'string'
            ? customerData
            : customerData?.id;

        if (!customerId) 
        {
            this.logger.error(
                `No customer ID found in subscription ${subscriptionId}`,
                undefined,
                logContext,
                requestId,
            );
            return null;
        }

        const user = await this.userService.findByStripeCustomerId(customerId, requestId);

        if (!user) 
        {
            this.logger.error(
                `User not found for Stripe customer ${customerId}`,
                undefined,
                logContext,
                requestId,
            );
            return null;
        }

        return { stripeSubscription, user };
    }
}
