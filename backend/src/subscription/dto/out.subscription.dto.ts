import { Expose, Transform } from 'class-transformer';
import { SubscriptionStatus, BillingInterval } from '../schemas/subscription.schema';

export class OutSubscriptionDto 
{
    @Expose()
    @Transform(({ obj }) => obj._id?.toString() || obj.id)
    id!: string;

    @Expose()
    status!: SubscriptionStatus;

    @Expose()
    autoRenew!: boolean;

    @Expose()
    billingInterval!: BillingInterval;

    @Expose()
    nextBillingDate!: Date;

    @Expose()
    amount!: number;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}
