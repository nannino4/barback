import { Expose } from 'class-transformer';
import { SubscriptionStatus } from '../schemas/subscription.schema';

/**
 * DTO for the frictionless trial activation response.
 * Returns the Stripe subscription ID (used to create the organization) and the
 * local subscription status (typically TRIALING).
 */
export class OutTrialActivationDto
{
    @Expose()
    stripeSubscriptionId!: string;

    @Expose()
    status!: SubscriptionStatus;
}
