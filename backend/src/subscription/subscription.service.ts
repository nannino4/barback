import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { Subscription, SubscriptionStatus, BillingInterval } from './schemas/subscription.schema';
import { UserService } from '../user/user.service';
import { StripeService, BillingInterval as StripeBillingInterval } from '../common/services/stripe.service';
import { CustomLogger } from '../common/logger/custom.logger';
import { DatabaseOperationException } from '../common/exceptions/database.exceptions';
import { 
    NotEligibleForTrialException,
    SubscriptionNotFoundException,
    SubscriptionNotFoundByIdException,
    InvalidSubscriptionOperationException,
    SubscriptionSetupFailedException,
} from './exceptions/subscription.exceptions';

@Injectable()
export class SubscriptionService 
{
    constructor(
        @InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>,
        private readonly userService: UserService,
        private readonly stripeService: StripeService,
        private readonly logger: CustomLogger,
    ) 
    {
        this.logger.log('SubscriptionService initialized', 'SubscriptionService#constructor');
    }

    /**
     * Setup subscription for payment collection
     * 
     * Creates a Stripe subscription with payment_behavior='default_incomplete' and returns
     * the clientSecret for Payment Element. Does NOT save to local database yet.
     * 
     * The local subscription will be created by the `customer.subscription.created` webhook
     * with initial status INCOMPLETE. Organization can be created immediately after payment
     * confirmation, without waiting for subscription to become ACTIVE.
     * 
     * For BOTH trial and paid subscriptions, we collect payment details upfront.
     * This follows Stripe best practices for seamless trial-to-paid conversion.
     * 
     * @param userId User ID
     * @param billingInterval Billing interval (MONTHLY or YEARLY)
     * @param isTrial Whether this is a trial subscription
     * @returns Object containing Stripe subscription ID and clientSecret
     */
    async setupSubscriptionPayment(
        userId: Types.ObjectId,
        billingInterval: StripeBillingInterval = StripeBillingInterval.MONTHLY,
        isTrial: boolean,
        requestId?: string,
    ): Promise<{ stripeSubscriptionId: string; clientSecret: string }>
    {
        this.logger.debug(
            `Setting up ${isTrial ? 'trial' : 'paid'} subscription payment for user: ${userId}`,
            'SubscriptionService#setupSubscriptionPayment',
            requestId,
        );

        // If trial requested, ensure eligibility
        if (isTrial)
        {
            const eligible = await this.isEligibleForTrial(userId, requestId);
            if (!eligible)
            {
                this.logger.warn(
                    `User ${userId} is not eligible for trial subscription`,
                    'SubscriptionService#setupSubscriptionPayment',
                    requestId,
                );
                throw new NotEligibleForTrialException('User already has a subscription or is not eligible for trial');
            }
        }

        // Retrieve user and ensure Stripe customer exists
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

        // Create subscription in Stripe (both trial and paid collect payment upfront)
        const stripeSubscription = await this.stripeService.createSubscription(
            stripeCustomerId,
            billingInterval,
            { isTrial },
            requestId,
        );

        // print all the stripeSubscription object for debugging
        this.logger.debug(
            `Stripe subscription created: ${JSON.stringify(stripeSubscription)} for user: ${userId}`,
            'SubscriptionService#setupSubscriptionPayment',
            requestId,
        );

        // Extract clientSecret from latest invoice
        // For incomplete subscriptions, we use confirmation_secret (includes both PaymentIntent and SetupIntent)
        let clientSecret: string | null = null;

        if (stripeSubscription.latest_invoice && typeof stripeSubscription.latest_invoice !== 'string')
        {
            const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;

            // confirmation_secret is present when Stripe creates an invoice that requires confirmation.
            // For trial subscriptions, Stripe often creates a $0 invoice with confirmation_secret=null.
            if (invoice.confirmation_secret)
            {
                clientSecret = invoice.confirmation_secret.client_secret || null;
            }
        }

        // Trial subscriptions typically use pending_setup_intent (not latest_invoice.confirmation_secret)
        if (!clientSecret && isTrial && stripeSubscription.pending_setup_intent)
        {
            const pendingSetupIntent = stripeSubscription.pending_setup_intent;

            if (typeof pendingSetupIntent === 'string')
            {
                const setupIntent = await this.stripeService.retrieveSetupIntent(pendingSetupIntent, requestId);
                clientSecret = setupIntent.client_secret || null;
            }
            else
            {
                clientSecret = (pendingSetupIntent as Stripe.SetupIntent).client_secret || null;
            }
        }

        if (!clientSecret)
        {
            // Cleanup Stripe subscription and throw 500 error (integration failure)
            try
            {
                this.logger.error(
                    `Missing client secret from Stripe subscription ${stripeSubscription.id}, canceling subscription`,
                    undefined,
                    'SubscriptionService#setupSubscriptionPayment',
                    requestId,
                );
                await this.stripeService.cancelSubscription(stripeSubscription.id, requestId);
            }
            catch (cleanupError)
            {
                this.logger.error(
                    `Failed to cleanup Stripe subscription ${stripeSubscription.id} after missing client secret`,
                    cleanupError instanceof Error ? cleanupError.stack : undefined,
                    'SubscriptionService#setupSubscriptionPayment',
                    requestId,
                );
            }

            throw new SubscriptionSetupFailedException('Client secret not available from Stripe');
        }

        this.logger.debug(
            `${isTrial ? 'Trial' : 'Paid'} subscription setup completed for user: ${userId}, Stripe subscription: ${stripeSubscription.id}`,
            'SubscriptionService#setupSubscriptionPayment',
            requestId,
        );

        // Return Stripe subscription ID and client secret
        // Local DB record will be created by webhook when stripe subscription creation event is received
        return { 
            stripeSubscriptionId: stripeSubscription.id,
            clientSecret,
        };
    }

    /**
     * Create local subscription record from Stripe subscription
     * Called by webhook handler on `customer.subscription.created` event
     * 
     * Initial status is typically INCOMPLETE (Stripe's default for subscriptions
     * with payment collection). Status will be updated by subsequent webhook events
     * as the subscription progresses through Stripe's lifecycle.
     * 
     * @param stripeSubscription Stripe subscription object  
     * @param userId User ID (from webhook context)
     * @returns Created subscription with initial INCOMPLETE status
     */
    async createFromStripeSubscription(
        stripeSubscription: Stripe.Subscription,
        userId: Types.ObjectId,
        requestId?: string,
    ): Promise<Subscription>
    {
        this.logger.debug(
            `Creating local subscription from Stripe subscription: ${stripeSubscription.id} for user: ${userId}`,
            'SubscriptionService#createFromStripeSubscription',
            requestId,
        );
        
        try
        {
            // Check if subscription already exists
            const existing = await this.subscriptionModel
                .findOne({ stripeSubscriptionId: stripeSubscription.id })
                .exec();

            if (existing)
            {
                this.logger.debug(
                    `Subscription already exists for Stripe subscription ${stripeSubscription.id}, updating status`,
                    'SubscriptionService#createFromStripeSubscription',
                    requestId,
                );
                return await this.updateFromStripeSubscription(stripeSubscription, requestId);
            }

            // Extract billing details from Stripe subscription
            const billingDetails = this.extractBillingDetails(stripeSubscription);

            const subscription = new this.subscriptionModel({
                userId: userId,
                stripeSubscriptionId: stripeSubscription.id,
                status: this.mapStripeStatusToLocal(stripeSubscription.status, requestId),
                autoRenew: true,
                billingInterval: billingDetails.billingInterval,
                nextBillingDate: billingDetails.nextBillingDate,
                amount: billingDetails.amount,
            });

            await subscription.save();

            this.logger.debug(
                `Local subscription created successfully for Stripe subscription: ${stripeSubscription.id}`,
                'SubscriptionService#createFromStripeSubscription',
                requestId,
            );

            return subscription;
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(
                `Database error during subscription creation from Stripe subscription: ${stripeSubscription.id}`,
                error instanceof Error ? error.stack : undefined,
                'SubscriptionService#createFromStripeSubscription',
                requestId,
            );
            throw new DatabaseOperationException('subscription creation from Stripe', errorMessage);
        }
    }

    async findAllByUserId(userId: Types.ObjectId, requestId?: string): Promise<Subscription[]> 
    {
        this.logger.debug(`Finding all subscriptions for user: ${userId}`, 'SubscriptionService#findAllByUserId', requestId);
        
        try 
        {
            return await this.subscriptionModel
                .find({ userId: userId })
                .sort({ createdAt: -1 }) // Most recent first
                .exec();
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(
                `Database error while finding subscriptions for user: ${userId} - ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'SubscriptionService#findAllByUserId',
                requestId,
            );
            throw new DatabaseOperationException('subscription lookup by user ID', errorMessage);
        }
    }

    async findById(id: Types.ObjectId, requestId?: string): Promise<Subscription> 
    {
        this.logger.debug(`Finding subscription by ID: ${id}`, 'SubscriptionService#findById', requestId);
        
        try 
        {
            const subscription = await this.subscriptionModel
                .findById(id)
                .exec();
            
            if (!subscription) 
            {
                this.logger.warn(`Subscription not found with ID: ${id}`, 'SubscriptionService#findById', requestId);
                throw new SubscriptionNotFoundByIdException(id.toString());
            }
            
            return subscription;
        }
        catch (error)
        {
            if (error instanceof SubscriptionNotFoundByIdException) 
            {
                throw error;
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(
                `Database error while finding subscription by ID: ${id} - ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'SubscriptionService#findById',
                requestId,
            );
            throw new DatabaseOperationException('subscription lookup by ID', errorMessage);
        }
    }

    async findByStripeSubscriptionId(stripeSubscriptionId: string, requestId?: string): Promise<Subscription> 
    {
        this.logger.debug(
            `Finding subscription by Stripe ID: ${stripeSubscriptionId}`,
            'SubscriptionService#findByStripeSubscriptionId',
            requestId,
        );
        
        try 
        {
            const subscription = await this.subscriptionModel
                .findOne({ stripeSubscriptionId })
                .exec();
            
            if (!subscription) 
            {
                this.logger.warn(
                    `Subscription not found with Stripe ID: ${stripeSubscriptionId}`,
                    'SubscriptionService#findByStripeSubscriptionId',
                    requestId,
                );
                throw new SubscriptionNotFoundException(stripeSubscriptionId);
            }
            
            return subscription;
        }
        catch (error)
        {
            if (error instanceof SubscriptionNotFoundException) 
            {
                throw error;
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(
                `Database error while finding subscription by Stripe ID: ${stripeSubscriptionId} - ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'SubscriptionService#findByStripeSubscriptionId',
                requestId,
            );
            throw new DatabaseOperationException('subscription lookup by Stripe ID', errorMessage);
        }
    }

    async updateStatus(stripeSubscriptionId: string, status: SubscriptionStatus, requestId?: string): Promise<Subscription> 
    {
        this.logger.debug(
            `Updating subscription status: ${stripeSubscriptionId} to ${status}`,
            'SubscriptionService#updateStatus',
            requestId,
        );
        
        try 
        {
            const subscription = await this.subscriptionModel
                .findOneAndUpdate(
                    { stripeSubscriptionId: stripeSubscriptionId },
                    { status: status },
                    { new: true }
                )
                .exec();
            
            if (!subscription) 
            {
                this.logger.warn(
                    `Subscription not found with Stripe ID: ${stripeSubscriptionId}`,
                    'SubscriptionService#updateStatus',
                    requestId,
                );
                throw new SubscriptionNotFoundException(stripeSubscriptionId);
            }
            
            this.logger.debug(
                `Subscription status updated successfully: ${stripeSubscriptionId}`,
                'SubscriptionService#updateStatus',
                requestId,
            );
            return subscription;
        }
        catch (error)
        {
            if (error instanceof SubscriptionNotFoundException) 
            {
                throw error;
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(
                `Database error while updating subscription status: ${stripeSubscriptionId} - ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
                'SubscriptionService#updateStatus',
                requestId,
            );
            throw new DatabaseOperationException('subscription status update', errorMessage);
        }
    }

    async cancelSubscription(userId: Types.ObjectId, subscriptionId: Types.ObjectId, requestId?: string): Promise<Subscription> 
    {
        this.logger.debug(
            `Cancelling subscription ${subscriptionId} for user: ${userId}`,
            'SubscriptionService#cancelSubscription',
            requestId,
        );
        
        // Find specific subscription and verify ownership
        const subscription = await this.findById(subscriptionId, requestId);
        
        if (subscription.userId.toString() !== userId.toString()) 
        {
            throw new InvalidSubscriptionOperationException('Subscription ownership mismatch', 'Subscription does not belong to the current user');
        }

        // Cancel subscription in Stripe
        try 
        {
            await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId, requestId);
        }
        catch (error)
        {
            this.logger.warn(
                `Failed to cancel Stripe subscription ${subscription.stripeSubscriptionId}, proceeding with local cancellation`,
                'SubscriptionService#cancelSubscription',
                requestId,
            );
        }

        // Update local subscription status
        try 
        {
            return await this.updateStatus(subscription.stripeSubscriptionId, SubscriptionStatus.CANCELED, requestId);
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(
                `Database error during subscription cancellation for user: ${userId}`,
                error instanceof Error ? error.stack : undefined,
                'SubscriptionService#cancelSubscription',
                requestId,
            );
            throw new DatabaseOperationException('subscription cancellation', errorMessage);
        }
    }

    async syncSubscriptionFromStripe(stripeSubscription: Stripe.Subscription, requestId?: string): Promise<void> 
    {
        this.logger.debug(
            `Syncing subscription from Stripe: ${stripeSubscription.id}`,
            'SubscriptionService#syncSubscriptionFromStripe',
            requestId,
        );

        await this.updateFromStripeSubscription(stripeSubscription, requestId);
    }

    private mapStripeStatusToLocal(stripeStatus: Stripe.Subscription.Status, requestId?: string): SubscriptionStatus 
    {
        switch (stripeStatus) 
        {
        case 'trialing':
            return SubscriptionStatus.TRIALING;
        case 'active':
            return SubscriptionStatus.ACTIVE;
        case 'past_due':
            return SubscriptionStatus.PAST_DUE;
        case 'canceled':
            return SubscriptionStatus.CANCELED;
        case 'unpaid':
            return SubscriptionStatus.UNPAID;
        case 'incomplete':
            return SubscriptionStatus.INCOMPLETE;
        case 'incomplete_expired':
            return SubscriptionStatus.INCOMPLETE_EXPIRED;
        case 'paused':
            return SubscriptionStatus.PAUSED;
        default:
            // Log and throw 500 error since this indicates an integration issue
            this.logger.error(
                `Unknown Stripe subscription status: ${stripeStatus}`,
                undefined,
                'SubscriptionService#mapStripeStatusToLocal',
                requestId,
            );
            throw new SubscriptionSetupFailedException(`Unknown Stripe subscription status: ${stripeStatus}`);
        }
    }

    /**
     * Extract billing details from a Stripe subscription
     */
    private extractBillingDetails(stripeSubscription: Stripe.Subscription): {
        billingInterval: BillingInterval;
        nextBillingDate: Date | null;
        amount: number | null;
    }
    {
        // Get billing interval from the first item's price
        let billingInterval = BillingInterval.MONTHLY;
        let amount: number | null = null;
        let nextBillingDate: Date | null = null;
        
        const firstItem = stripeSubscription.items?.data?.[0];
        if (firstItem?.price)
        {
            // Map Stripe interval to our enum
            if (firstItem.price.recurring?.interval === 'year')
            {
                billingInterval = BillingInterval.YEARLY;
            }
            // Get amount in cents
            amount = firstItem.price.unit_amount ?? null;
        }

        // Get next billing date from subscription item's current_period_end
        if (firstItem?.current_period_end)
        {
            nextBillingDate = new Date(firstItem.current_period_end * 1000);
        }

        return { billingInterval, nextBillingDate, amount };
    }

    /**
     * Update local subscription record from Stripe subscription data
     * Updates status and billing details
     */
    async updateFromStripeSubscription(stripeSubscription: Stripe.Subscription, requestId?: string): Promise<Subscription>
    {
        this.logger.debug(
            `Updating local subscription from Stripe subscription: ${stripeSubscription.id}`,
            'SubscriptionService#updateFromStripeSubscription',
            requestId,
        );

        const billingDetails = this.extractBillingDetails(stripeSubscription);
        const status = this.mapStripeStatusToLocal(stripeSubscription.status, requestId);

        try
        {
            const subscription = await this.subscriptionModel
                .findOneAndUpdate(
                    { stripeSubscriptionId: stripeSubscription.id },
                    {
                        status: status,
                        billingInterval: billingDetails.billingInterval,
                        nextBillingDate: billingDetails.nextBillingDate,
                        amount: billingDetails.amount,
                    },
                    { new: true }
                )
                .exec();

            if (!subscription)
            {
                throw new SubscriptionNotFoundException(stripeSubscription.id);
            }

            return subscription;
        }
        catch (error)
        {
            if (error instanceof SubscriptionNotFoundException)
            {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            this.logger.error(
                `Database error during subscription update from Stripe: ${stripeSubscription.id}`,
                error instanceof Error ? error.stack : undefined,
                'SubscriptionService#updateFromStripeSubscription',
                requestId,
            );
            throw new DatabaseOperationException('subscription update from Stripe', errorMessage);
        }
    }

    async isEligibleForTrial(userId: Types.ObjectId, requestId?: string): Promise<boolean> 
    {
        this.logger.debug(`Checking trial eligibility for user: ${userId}`, 'SubscriptionService#isEligibleForTrial', requestId);
        
        try 
        {
            // Check if user has any existing subscriptions
            const existingSubscriptionCount = await this.subscriptionModel
                .countDocuments({ 
                    userId: userId,
                })
                .exec();
            
            // User is eligible for trial only if this is their first subscription
            const isEligible = existingSubscriptionCount === 0;
            this.logger.debug(
                `User: ${userId} trial eligibility: ${isEligible}`,
                'SubscriptionService#isEligibleForTrial',
                requestId,
            );
            return isEligible;
        }
        catch (error)
        {
            // If it's a database error, re-throw it
            if (error instanceof DatabaseOperationException) 
            {
                throw error;
            }
            // For other errors, assume not eligible for safety
            this.logger.error(
                `Error checking trial eligibility for user: ${userId}`,
                error instanceof Error ? error.stack : undefined,
                'SubscriptionService#isEligibleForTrial',
                requestId,
            );
            return false;
        }
    }
}
