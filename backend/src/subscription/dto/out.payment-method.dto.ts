import { Expose, Transform } from 'class-transformer';

export class OutPaymentMethodUsageDto
{
    @Expose()
    organizationId!: string;

    @Expose()
    organizationName!: string;

    @Expose()
    subscriptionId!: string;

    @Expose()
    subscriptionStatus!: string;
}

export class OutPaymentMethodDto 
{
    @Expose()
    id!: string;

    @Expose()
    type!: string;

    @Expose()
    @Transform(({ obj }) => obj.card ? {
        brand: obj.card.brand,
        last4: obj.card.last4,
        expMonth: obj.card.exp_month,
        expYear: obj.card.exp_year,
    } : undefined)
    card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };

    @Expose()
    isDefault!: boolean;

    @Expose()
    @Transform(({ obj }) => Array.isArray(obj.usedBySubscriptions)
        ? obj.usedBySubscriptions.map((usage: Record<string, unknown>) => ({
            organizationId: usage.organizationId,
            organizationName: usage.organizationName,
            subscriptionId: usage.subscriptionId,
            subscriptionStatus: usage.subscriptionStatus,
        }))
        : [])
    usedBySubscriptions!: OutPaymentMethodUsageDto[];
}
