import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class InAddPaymentMethodDto 
{
    @IsString({ message: 'validation.subscription.paymentMethodId.mustBeString' })
    paymentMethodId!: string;

    @IsOptional()
    @IsBoolean({ message: 'validation.subscription.setAsDefault.mustBeBoolean' })
    setAsDefault?: boolean;
}
