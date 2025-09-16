export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

// Core organization data structure from backend
export interface Organization {
    id: string;
    name: string;
    settings: {
        defaultCurrency: string;
    };
    createdAt: string;
    updatedAt: string;
}

// User profile structure from backend
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    profilePictureUrl: string | null;
    isEmailVerified: boolean;
}

// Backend returns this structure for GET /api/orgs
export interface OrganizationMembership {
    user: User;
    org: Organization;
    role: UserRole;
}

export interface Invitation {
    id: string;
    invitedEmail: string;
    role: UserRole;
    status: InvitationStatus;
    invitedBy: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    organization: {
        id: string;
        name: string;
    };
    createdAt: string;
    expiresAt: string;
}

// API Request/Response types
export interface CreateOrganizationRequest {
    name: string;
    subscriptionId: string;
    settings?: {
        defaultCurrency?: string;
    };
}

export interface InviteUserRequest {
    invitedEmail: string;
    role: Exclude<UserRole, 'OWNER'>; // Cannot invite as owner
}
