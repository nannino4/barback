import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/schemas/user.schema';
import { SubscriptionService } from './subscription.service';
import { InCreateSubscriptionDto } from './dto/in.create-subscription.dto';
import { InAddPaymentMethodDto } from './dto/in.add-payment-method.dto';
import { OutSubscriptionDto } from './dto/out.subscription.dto';
import { OutSubscriptionSetupDto } from './dto/out.subscription-setup.dto';
import { OutTrialActivationDto } from './dto/out.trial-activation.dto';
import { OutStripeSubscriptionStatusDto } from './dto/out.stripe-subscription-status.dto';
import { OutSubscriptionResumePreviewDto } from './dto/out.subscription-resume-preview.dto';
import { BillingInterval as StripeBillingInterval } from '../common/services/stripe.service';
import { ObjectIdValidationPipe } from '../pipes/object-id-validation.pipe';
import { plainToInstance } from 'class-transformer';
import { CustomLogger } from '../common/logger/custom.logger';
import { SubscriptionOwnershipException } from 'src/org/exceptions/org.exceptions';
import { RequestId } from '../common/decorators/request-id.decorator';

@Controller('subscriptions')
export class SubscriptionController 
{
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly logger: CustomLogger,
    ) 
    {
        this.logger.log('SubscriptionController initialized', 'SubscriptionController#constructor');
    }

    @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
    @Get()
    async getAllSubscriptions(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<OutSubscriptionDto[]> 
    {
        this.logger.debug(`Getting all subscriptions for user: ${user.id}`, 'SubscriptionController#getAllSubscriptions', requestId);
        
        const subscriptions = await this.subscriptionService.findAllByUserId(user.id, requestId);
        return plainToInstance(OutSubscriptionDto, subscriptions.map(sub => sub.toObject()), { excludeExtraneousValues: true });
    }

    /**
     * Setup subscription for payment collection
     * 
     * Creates a Stripe subscription and returns clientSecret for Payment Element.
     * Does NOT save subscription locally - that happens via webhook after payment confirmation.
     * Both trial and paid subscriptions collect payment details upfront.
     */
    @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
    @Post()
    async setupSubscriptionPayment(
        @CurrentUser() user: User,
        @Body() createSubscriptionDto: InCreateSubscriptionDto,
        @RequestId() requestId?: string,
    ): Promise<OutSubscriptionSetupDto> 
    {
        this.logger.log(
            `Setting up ${createSubscriptionDto.isTrial ? 'trial' : 'paid'} subscription payment for user: ${user.id}`,
            'SubscriptionController#setupSubscriptionPayment',
            requestId,
        );
        
        const result = await this.subscriptionService.setupSubscriptionPayment(
            user.id,
            createSubscriptionDto.billingInterval,
            createSubscriptionDto.isTrial,
            requestId,
        );

        this.logger.log(
            `Subscription setup started: userId=${user.id} stripeSubscriptionId=${result.stripeSubscriptionId} isTrial=${createSubscriptionDto.isTrial}`,
            'SubscriptionController#setupSubscriptionPayment',
            requestId,
        );
        
        return plainToInstance(
            OutSubscriptionSetupDto,
            result,
            { excludeExtraneousValues: true }
        );
    }

    /**
     * Activate a frictionless free trial (no payment method collected).
     *
     * Creates a Stripe trial subscription and the local subscription record
     * synchronously, so the organization can be created immediately afterwards.
     * Returns the Stripe subscription ID and the local status (TRIALING).
     */
    @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
    @Post('trial')
    async activateTrial(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<OutTrialActivationDto>
    {
        this.logger.log(`Activating frictionless trial for user: ${user.id}`, 'SubscriptionController#activateTrial', requestId);

        const subscription = await this.subscriptionService.activateTrialSubscription(
            user.id,
            StripeBillingInterval.YEARLY,
            requestId,
        );

        this.logger.log(
            `Trial activated: userId=${user.id} stripeSubscriptionId=${subscription.stripeSubscriptionId} status=${subscription.status}`,
            'SubscriptionController#activateTrial',
            requestId,
        );

        return plainToInstance(OutTrialActivationDto, subscription.toObject(), { excludeExtraneousValues: true });
    }

    /**
     * Attach a payment method to a subscription and (re)activate billing.
     * Used by the add-payment flow after a frictionless trial.
     */
    @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
    @Post(':id/payment-method')
    async attachPaymentMethod(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) subscriptionId: Types.ObjectId,
        @Body() addPaymentMethodDto: InAddPaymentMethodDto,
        @RequestId() requestId?: string,
    ): Promise<OutSubscriptionDto>
    {
        this.logger.log(
            `Attaching payment method to subscription ${subscriptionId} for user: ${user.id}`,
            'SubscriptionController#attachPaymentMethod',
            requestId,
        );

        const subscription = await this.subscriptionService.attachPaymentMethodToSubscription(
            user.id,
            subscriptionId,
            addPaymentMethodDto.paymentMethodId,
            addPaymentMethodDto.setAsDefault === true,
            requestId,
        );
        const responseObject = await this.subscriptionService.toResponseObject(subscription, requestId);

        return plainToInstance(OutSubscriptionDto, responseObject, { excludeExtraneousValues: true });
    }

    @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
    @Get(':id/resume-preview')
    async getResumePreview(
        @CurrentUser() user: User,
        @Param('id', ObjectIdValidationPipe) subscriptionId: Types.ObjectId,
        @RequestId() requestId?: string,
    ): Promise<OutSubscriptionResumePreviewDto>
    {
        this.logger.debug(
            `Getting resume preview for subscription ${subscriptionId} for user: ${user.id}`,
            'SubscriptionController#getResumePreview',
            requestId,
        );

        const preview = await this.subscriptionService.getResumePreview(user.id, subscriptionId, requestId);
        return plainToInstance(OutSubscriptionResumePreviewDto, preview, { excludeExtraneousValues: true });
    }

    @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
    @Get('trial-eligibility')
    async checkTrialEligibility(
        @CurrentUser() user: User,
        @RequestId() requestId?: string,
    ): Promise<{ eligible: boolean }> 
    {
        this.logger.debug(`Checking trial eligibility for user: ${user.id}`, 'SubscriptionController#checkTrialEligibility', requestId);
        
        const eligible = await this.subscriptionService.isEligibleForTrial(user.id, requestId);
        return { eligible };
    }

    @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
    @Get('stripe/:stripeSubscriptionId')
    async getStripeSubscriptionStatus(
        @CurrentUser() user: User,
        @Param('stripeSubscriptionId') stripeSubscriptionId: string,
        @RequestId() requestId?: string,
    ): Promise<OutStripeSubscriptionStatusDto>
    {
        this.logger.debug(
            `Getting Stripe subscription status for user: ${user.id} and subscription: ${stripeSubscriptionId}`,
            'SubscriptionController#getStripeSubscriptionStatus',
            requestId,
        );

        const subscription = await this.subscriptionService.findByStripeSubscriptionId(stripeSubscriptionId, requestId);
        if (subscription.userId.toString() !== user.id)
        {
            this.logger.warn(
                `User: ${user.id} attempted to access subscription: ${stripeSubscriptionId} which does not belong to them.`,
                'SubscriptionController#getStripeSubscriptionStatus',
                requestId,
            );
            throw new SubscriptionOwnershipException(subscription.id);
        }

        return plainToInstance(OutStripeSubscriptionStatusDto, subscription.toObject(), { excludeExtraneousValues: true });
    }
}
