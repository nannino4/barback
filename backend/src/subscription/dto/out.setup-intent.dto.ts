import { Expose } from 'class-transformer';

/**
 * DTO for the SetupIntent response used by the add-payment flow.
 * Returns the clientSecret to confirm with Stripe Elements.
 */
export class OutSetupIntentDto
{
    @Expose()
    clientSecret!: string;
}
