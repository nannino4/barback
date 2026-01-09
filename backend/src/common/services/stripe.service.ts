import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CustomLogger } from '../logger/custom.logger';
import { 
    StripeConfigurationException, 
    StripeCustomerException, 
    StripeSubscriptionException,
    StripeServiceUnavailableException,
    StripePaymentMethodException,
} from '../exceptions/stripe.exceptions';

export enum BillingInterval {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

@Injectable()
export class StripeService 
{
    private readonly stripe: Stripe;
    private readonly priceIds: {
        basicMonthly: string;
        basicYearly: string;
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: CustomLogger,
    ) 
    {
        const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) 
        {
            this.logger.error('STRIPE_SECRET_KEY is not configured', undefined, 'StripeService#constructor');
            throw new StripeConfigurationException('STRIPE_SECRET_KEY is not configured');
        }

        // Load multiple price IDs for different billing intervals
        const basicMonthlyPriceId = this.configService.get<string>('STRIPE_BASIC_MONTHLY_PRICE_ID');
        const basicYearlyPriceId = this.configService.get<string>('STRIPE_BASIC_YEARLY_PRICE_ID');
        if (!basicMonthlyPriceId) 
        {
            this.logger.error('STRIPE_BASIC_MONTHLY_PRICE_ID is not configured', undefined, 'StripeService#constructor');
            throw new StripeConfigurationException('STRIPE_BASIC_MONTHLY_PRICE_ID is not configured');
        }
        if (!basicYearlyPriceId) 
        {
            this.logger.error('STRIPE_BASIC_YEARLY_PRICE_ID is not configured', undefined, 'StripeService#constructor');
            throw new StripeConfigurationException('STRIPE_BASIC_YEARLY_PRICE_ID is not configured');
        }
        this.priceIds = {
            basicMonthly: basicMonthlyPriceId,
            basicYearly: basicYearlyPriceId,
        };
        
        try 
        {
            this.stripe = new Stripe(stripeSecretKey, {
                apiVersion: '2025-12-15.clover',
            });
        }
        catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : 'Unknown Stripe initialization error';
            this.logger.error(`Failed to initialize Stripe: ${errorMessage}`, error instanceof Error ? error.stack : undefined, 'StripeService#constructor');
            throw new StripeConfigurationException(`Failed to initialize Stripe: ${errorMessage}`);
        }
        
        this.logger.debug('StripeService initialized', 'StripeService#constructor');
    }

    // Customer Management
    async createCustomer(email: string, name: string, requestId?: string): Promise<Stripe.Customer> 
    {
        this.logger.debug(`Creating Stripe customer: ${email}`, 'StripeService#createCustomer', requestId);
        
        try 
        {
            const customer = await this.stripe.customers.create({
                email,
                name,
            });
            
            this.logger.debug(`Stripe customer created: ${customer.id}`, 'StripeService#createCustomer', requestId);
            return customer;
        }
        catch (error)
        {
            this.logger.error(`Failed to create Stripe customer: ${email}`, error instanceof Error ? error.stack : undefined, 'StripeService#createCustomer', requestId);
            this.handleStripeError(error, 'customer creation', requestId);
        }
    }

    async updateCustomer(customerId: string, updateData: Stripe.CustomerUpdateParams, requestId?: string): Promise<Stripe.Customer> 
    {
        this.logger.debug(`Updating Stripe customer: ${customerId}`, 'StripeService#updateCustomer', requestId);
        
        try 
        {
            const customer = await this.stripe.customers.update(customerId, updateData);
            this.logger.debug(`Stripe customer updated: ${customerId}`, 'StripeService#updateCustomer', requestId);
            return customer;
        }
        catch (error)
        {
            this.logger.error(`Failed to update Stripe customer: ${customerId}`, error instanceof Error ? error.stack : undefined, 'StripeService#updateCustomer', requestId);
            this.handleStripeError(error, 'customer update', requestId);
        }
    }

    /**
     * Create a subscription with payment collection
     * 
     * For BOTH trial and paid subscriptions:
     * - Creates subscription with payment_behavior='default_incomplete'
     * - Expands latest_invoice.confirmation_secret to get clientSecret
     * - Returns subscription with incomplete status (requires payment confirmation)
     * 
     * Trial subscriptions:
     * - Have $0 first invoice but still collect payment method
     * - Use trial_period_days for simpler configuration
     * - Automatically convert to paid after trial period ends
     * - Follow Stripe best practice for seamless conversion
     * 
     * @param customerId Stripe customer ID
     * @param billingInterval Billing interval (monthly/yearly)
     * @param options Additional creation options
     */
    async createSubscription(
        customerId: string,
        billingInterval: BillingInterval = BillingInterval.MONTHLY,
        options?: { isTrial?: boolean; trialPeriodDays?: number },
        requestId?: string,
    ): Promise<Stripe.Subscription>
    {
        const isTrial = options?.isTrial === true;
        this.logger.debug(
            `Creating ${isTrial ? 'trial' : 'paid'} subscription for customer: ${customerId} with ${billingInterval} billing`,
            'StripeService#createSubscription',
            requestId,
        );

        try
        {
            const priceId = this.getPriceId(billingInterval, requestId);
            
            const subscriptionParams: Stripe.SubscriptionCreateParams = {
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: 'default_incomplete',
                payment_settings: { 
                    save_default_payment_method: 'on_subscription',
                },
                // Expand confirmation_secret to get clientSecret for Payment Element
                expand: ['latest_invoice.confirmation_secret', 'pending_setup_intent'],
            };

            if (isTrial)
            {
                // Use trial_period_days for simpler configuration (default 90 days)
                const trialDays = options?.trialPeriodDays ?? 90;
                if (trialDays <= 0)
                {
                    this.logger.error(
                        `Invalid trial period days (${trialDays})`,
                        undefined,
                        'StripeService#createSubscription',
                        requestId,
                    );
                    throw new StripeSubscriptionException('trial configuration', 'Trial period days must be a positive number');
                }
                subscriptionParams.trial_period_days = trialDays;
            }

            // print subscriptionParams for debugging
            this.logger.debug(
                `Subscription parameters: ${JSON.stringify(subscriptionParams)}`,
                'StripeService#createSubscription',
                requestId,
            );

            const subscription = await this.stripe.subscriptions.create(subscriptionParams);
            
            // print the full subscription object for debugging
            this.logger.debug(
                `Full subscription object: ${JSON.stringify(subscription)}`,
                'StripeService#createSubscription',
                requestId,
            );

            this.logger.debug(
                `${isTrial ? 'Trial' : 'Paid'} subscription created: ${subscription.id}`,
                'StripeService#createSubscription',
                requestId,
            );
            
            return subscription;
        }
        catch (error)
        {
            this.logger.error(
                `Failed to create ${options?.isTrial ? 'trial' : 'paid'} subscription for customer: ${customerId}`,
                error instanceof Error ? error.stack : undefined,
                'StripeService#createSubscription',
                requestId,
            );
            this.handleStripeError(error, 'subscription creation', requestId);
        }
    }


    async cancelSubscription(subscriptionId: string, requestId?: string): Promise<Stripe.Subscription> 
    {
        this.logger.debug(`Cancelling subscription: ${subscriptionId}`, 'StripeService#cancelSubscription', requestId);
        
        try 
        {
            const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
            this.logger.debug(`Subscription cancelled: ${subscriptionId}`, 'StripeService#cancelSubscription', requestId);
            return subscription;
        }
        catch (error)
        {
            this.logger.error(`Failed to cancel subscription: ${subscriptionId}`, error instanceof Error ? error.stack : undefined, 'StripeService#cancelSubscription', requestId);
            this.handleStripeError(error, 'subscription cancellation', requestId);
        }
    }

    async retrieveSubscription(subscriptionId: string, requestId?: string): Promise<Stripe.Subscription> 
    {
        this.logger.debug(`Retrieving subscription: ${subscriptionId}`, 'StripeService#retrieveSubscription', requestId);
        
        try 
        {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            this.logger.debug(`Subscription retrieved: ${subscriptionId}`, 'StripeService#retrieveSubscription', requestId);
            return subscription;
        }
        catch (error)
        {
            this.logger.error(`Failed to retrieve subscription: ${subscriptionId}`, error instanceof Error ? error.stack : undefined, 'StripeService#retrieveSubscription', requestId);
            this.handleStripeError(error, 'subscription retrieval', requestId);
        }
    }

    async retrieveSetupIntent(setupIntentId: string, requestId?: string): Promise<Stripe.SetupIntent>
    {
        this.logger.debug(`Retrieving setup intent: ${setupIntentId}`, 'StripeService#retrieveSetupIntent', requestId);

        try
        {
            const setupIntent = await this.stripe.setupIntents.retrieve(setupIntentId);
            this.logger.debug(`Setup intent retrieved: ${setupIntentId}`, 'StripeService#retrieveSetupIntent', requestId);
            return setupIntent;
        }
        catch (error)
        {
            this.logger.error(
                `Failed to retrieve setup intent: ${setupIntentId}`,
                error instanceof Error ? error.stack : undefined,
                'StripeService#retrieveSetupIntent',
                requestId,
            );
            this.handleStripeError(error, 'payment setup intent retrieval', requestId);
        }
    }

    // Payment Method Management
    async attachPaymentMethod(paymentMethodId: string, customerId: string, requestId?: string): Promise<Stripe.PaymentMethod> 
    {
        this.logger.debug(`Attaching payment method ${paymentMethodId} to customer: ${customerId}`, 'StripeService#attachPaymentMethod', requestId);
        
        try 
        {
            const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });
            this.logger.debug(`Payment method attached: ${paymentMethodId}`, 'StripeService#attachPaymentMethod', requestId);
            return paymentMethod;
        }
        catch (error)
        {
            this.logger.error(`Failed to attach payment method ${paymentMethodId} to customer: ${customerId}`, error instanceof Error ? error.stack : undefined, 'StripeService#attachPaymentMethod', requestId);
            this.handleStripeError(error, 'payment method attachment', requestId);
        }
    }

    async detachPaymentMethod(paymentMethodId: string, requestId?: string): Promise<Stripe.PaymentMethod> 
    {
        this.logger.debug(`Detaching payment method: ${paymentMethodId}`, 'StripeService#detachPaymentMethod', requestId);
        
        try 
        {
            const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);
            this.logger.debug(`Payment method detached: ${paymentMethodId}`, 'StripeService#detachPaymentMethod', requestId);
            return paymentMethod;
        }
        catch (error)
        {
            this.logger.error(`Failed to detach payment method: ${paymentMethodId}`, error instanceof Error ? error.stack : undefined, 'StripeService#detachPaymentMethod', requestId);
            this.handleStripeError(error, 'payment method detachment', requestId);
        }
    }

    async listPaymentMethods(customerId: string, type: Stripe.PaymentMethodListParams.Type = 'card', requestId?: string): Promise<Stripe.PaymentMethod[]> 
    {
        this.logger.debug(`Listing payment methods for customer: ${customerId}`, 'StripeService#listPaymentMethods', requestId);
        
        try 
        {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type,
            });
            this.logger.debug(`Found ${paymentMethods.data.length} payment methods for customer: ${customerId}`, 'StripeService#listPaymentMethods', requestId);
            return paymentMethods.data;
        }
        catch (error)
        {
            this.logger.error(`Failed to list payment methods for customer: ${customerId}`, error instanceof Error ? error.stack : undefined, 'StripeService#listPaymentMethods', requestId);
            this.handleStripeError(error, 'payment method listing', requestId);
        }
    }

    async retrievePaymentMethod(paymentMethodId: string, requestId?: string): Promise<Stripe.PaymentMethod> 
    {
        this.logger.debug(`Retrieving payment method: ${paymentMethodId}`, 'StripeService#retrievePaymentMethod', requestId);
        
        try 
        {
            const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
            this.logger.debug(`Payment method retrieved: ${paymentMethodId}`, 'StripeService#retrievePaymentMethod', requestId);
            return paymentMethod;
        }
        catch (error)
        {
            this.logger.error(`Failed to retrieve payment method: ${paymentMethodId}`, error instanceof Error ? error.stack : undefined, 'StripeService#retrievePaymentMethod', requestId);
            this.handleStripeError(error, 'payment method retrieval', requestId);
        }
    }

    async setDefaultPaymentMethod(customerId: string, paymentMethodId: string, requestId?: string): Promise<Stripe.Customer> 
    {
        this.logger.debug(`Setting default payment method ${paymentMethodId} for customer: ${customerId}`, 'StripeService#setDefaultPaymentMethod', requestId);
        
        try 
        {
            const customer = await this.stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            this.logger.debug(`Default payment method set for customer: ${customerId}`, 'StripeService#setDefaultPaymentMethod', requestId);
            return customer;
        }
        catch (error)
        {
            this.logger.error(`Failed to set default payment method for customer: ${customerId}`, error instanceof Error ? error.stack : undefined, 'StripeService#setDefaultPaymentMethod', requestId);
            this.handleStripeError(error, 'default payment method setting', requestId);
        }
    }

    // Webhook handling
    constructWebhookEvent(body: string | Buffer, signature: string, secret: string, requestId?: string): Stripe.Event 
    {
        try 
        {
            return this.stripe.webhooks.constructEvent(body, signature, secret);
        }
        catch (error)
        {
            this.logger.error('Failed to construct webhook event', error instanceof Error ? error.stack : undefined, 'StripeService#constructWebhookEvent', requestId);
            throw error;
        }
    }

    // Utility methods
    getPriceId(billingInterval: BillingInterval, requestId?: string): string 
    {
        switch (billingInterval) 
        {
        case BillingInterval.MONTHLY:
            return this.priceIds.basicMonthly;
        case BillingInterval.YEARLY:
            return this.priceIds.basicYearly;
        default:
            this.logger.error(`Invalid billing interval: ${billingInterval}`, undefined, 'StripeService#getPriceId', requestId);
            throw new StripeConfigurationException(`Invalid billing interval: ${billingInterval}`);
        }
    }

    /**
     * Helper method to handle Stripe errors consistently
     */
    private handleStripeError(error: unknown, operation: string, requestId?: string): never 
    {
        if (error instanceof Stripe.errors.StripeError) 
        {
            if (error.code === 'rate_limit') 
            {
                throw new StripeServiceUnavailableException();
            }
            else if (error.type === 'StripeInvalidRequestError') 
            {
                if (operation.includes('customer')) 
                {
                    throw new StripeCustomerException(operation, error.message);
                }
                else if (operation.includes('subscription')) 
                {
                    throw new StripeSubscriptionException(operation, error.message);
                }
                else if (operation.includes('payment')) 
                {
                    throw new StripePaymentMethodException(operation, error.message);
                }
            }
            
            this.logger.error(`Stripe error during ${operation}: ${error.message}`, error.stack, 'StripeService#handleStripeError', requestId);
            throw new StripeServiceUnavailableException();
        }
        
        this.logger.error(`Unknown error during ${operation}`, error instanceof Error ? error.stack : undefined, 'StripeService#handleStripeError', requestId);
        throw new StripeServiceUnavailableException();
    }

}
