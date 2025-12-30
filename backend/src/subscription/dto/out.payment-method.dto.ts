import { Expose, Transform } from 'class-transformer';

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
}
