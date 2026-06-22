import { Expose } from 'class-transformer';
import { BillingInterval } from '../schemas/subscription.schema';

/**
 * DTO for the amount Stripe previews when a paused subscription is resumed.
 */
export class OutSubscriptionResumePreviewDto
{
    @Expose()
    amountDue!: number;

    @Expose()
    currency!: string;

    @Expose()
    recurringAmount!: number;

    @Expose()
    recurringCurrency!: string;

    @Expose()
    billingInterval!: BillingInterval;

    @Expose()
    nextBillingDate!: Date;
}
