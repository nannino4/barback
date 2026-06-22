import { Expose, Transform } from 'class-transformer';
import { SubscriptionStatus, BillingInterval } from '../schemas/subscription.schema';

class OutSubscriptionPaymentMethodDto
{
    @Expose()
    id!: string;

    @Expose()
    type!: string;

    @Expose()
    brand?: string;

    @Expose()
    last4?: string;

    @Expose()
    expMonth?: number;

    @Expose()
    expYear?: number;

    @Expose()
    isDefault!: boolean;
}

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
    paymentMethod?: OutSubscriptionPaymentMethodDto;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}
