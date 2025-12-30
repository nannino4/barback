import { Expose } from 'class-transformer';
import { SubscriptionStatus } from '../schemas/subscription.schema';

/**
 * Subscription status DTO - minimal subscription info for non-owner members
 * 
 * Used by non-owner members to view subscription status without sensitive details
 */
export class OutSubscriptionStatusDto 
{
    @Expose()
    status!: SubscriptionStatus;
}
