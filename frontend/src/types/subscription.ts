export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'expired';

export interface Subscription {
    id: string;
    status: SubscriptionStatus;
    autoRenew: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    duration: string;
    price: number;
    features: string[];
}

export interface TrialEligibilityResponse {
    eligible: boolean;
    reason?: string;
}

export interface PaymentMethod {
    id: string;
    type: 'card';
    card: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
    isDefault: boolean;
    createdAt: string;
}

export interface StartTrialResponse {
    subscription: Subscription;
}
