# Organization Management - Frontend Architecture Plan

## Executive Summary

This document outlines the comprehensive architecture for implementing organization management features in the Barback frontend application. The design focuses on production-grade quality, following established coding guidelines, and providing excellent user experience for multi-organization workflows.

**Current State**: The existing `OrganizationsPage` provides basic organization selection and invitation acceptance. It needs to be replaced with a robust, scalable architecture that supports comprehensive organization management.

**Target State**: A complete organization management system with separate pages/flows for:
- Organization selection and switching
- Owned organization management (members, subscriptions, invitations)
- Creating new organizations with Stripe integration
- Managing received invitations

---

## Table of Contents

1. [Requirements Analysis](#requirements-analysis)
2. [Information Architecture](#information-architecture)
3. [Route Structure](#route-structure)
4. [Page Components Architecture](#page-components-architecture)
5. [Feature Components Architecture](#feature-components-architecture)
6. [State Management Strategy](#state-management-strategy)
7. [API Integration Layer](#api-integration-layer)
8. [Type System & Validation](#type-system--validation)
9. [Navigation & UX Flow](#navigation--ux-flow)
10. [Subscription & Payment Integration](#subscription--payment-integration)
11. [Localization Strategy](#localization-strategy)
12. [Implementation Phases](#implementation-phases)
13. [Testing Strategy](#testing-strategy)

---

## Requirements Analysis

### Functional Requirements

#### 1. Organization Selection & Switching
- **FR-1.1**: Users can view all organizations they are members of
- **FR-1.2**: Users can filter organizations by role (Owner, Manager, Staff)
- **FR-1.3**: Users can search organizations by name
- **FR-1.4**: Users can select a working organization
- **FR-1.5**: Selected organization persists across sessions
- **FR-1.6**: Users are redirected to their intended destination after selection

#### 2. Owned Organization Management
- **FR-2.1**: Organization owners can view organization details
- **FR-2.2**: Organization owners can edit organization name and settings
- **FR-2.3**: Organization owners can view all organization members with roles
- **FR-2.4**: Organization owners can view subscription status and details
- **FR-2.5**: Organization owners can manage payment methods (add, remove, set default)
- **FR-2.6**: Organization owners can cancel subscription
- **FR-2.7**: Organization owners can renew cancelled subscription

#### 3. Invitation Management (Owner/Manager)
- **FR-3.1**: Owners/Managers can send invitations to new users by email
- **FR-3.2**: Owners/Managers can specify invited user role (Manager, Staff)
- **FR-3.3**: Owners/Managers can view all pending invitations
- **FR-3.4**: Owners/Managers can revoke pending invitations
- **FR-3.5**: Invitation status is clearly displayed (pending, sent date, expiry)
- **FR-3.6**: Expired invitations are hidden by default with "Show Expired" toggle

#### 4. Received Invitations Management
- **FR-4.1**: Users can view all pending invitations received
- **FR-4.2**: Users can see organization details for each invitation
- **FR-4.3**: Users can see who invited them
- **FR-4.4**: Users can accept invitations
- **FR-4.5**: Users can decline invitations
- **FR-4.6**: Accepted invitations add user to organization immediately

#### 5. Organization Creation
- **FR-5.1**: Users can create new organizations
- **FR-5.2**: System checks trial eligibility before creation
- **FR-5.3**: Trial-eligible users get 3-month free trial
- **FR-5.4**: Non-trial users must provide payment method
- **FR-5.5**: Organization creation includes subscription creation
- **FR-5.6**: Stripe integration for payment method collection
- **FR-5.7**: Users can select billing period (monthly/yearly)
- **FR-5.8**: After creation, users are redirected to organization management
- **FR-5.9**: Users can have **one active subscription per owned organization**

#### 6. Payment Failure Handling
- **FR-6.1**: Subscription status shows "Past Due" or "Unpaid" when payment fails
- **FR-6.2**: Alert banner in subscription tab with retry payment action
- **FR-6.3**: Users can update payment method while in failed state
- **FR-6.4**: Clear error messaging: "Payment failed. Please update your payment method or try again."
- **FR-6.5**: Email notifications sent by Stripe webhooks (backend handles this)

### Non-Functional Requirements

#### Performance
- **NFR-1**: Organization list loads in < 1 second
- **NFR-2**: Organization switching is instant (< 200ms)
- **NFR-3**: Payment method updates complete in < 2 seconds

#### User Experience
- **NFR-4**: All actions provide immediate feedback (loading states)
- **NFR-5**: Errors are displayed declaratively (no imperative toasts for forms)
- **NFR-6**: Mobile-first responsive design
- **NFR-7**: Accessible (WCAG 2.1 AA compliance)

#### Security
- **NFR-8**: Only owners can manage subscriptions and payment methods
- **NFR-9**: Only owners/managers can send invitations
- **NFR-10**: Payment information is handled entirely by Stripe (PCI compliance)

#### Maintainability
- **NFR-11**: Follows established coding guidelines
- **NFR-12**: Comprehensive type safety with Zod schemas
- **NFR-13**: Localized for English and Italian
- **NFR-14**: Reusable components with clear responsibilities

---

## Information Architecture

### Content Hierarchy

```
Organizations
├── My Organizations (Selection)
│   ├── Organization Cards (all memberships)
│   ├── Filter by Role (Owner, Manager, Staff)
│   └── Search by Name
│
├── Organization Management (Owner-only)
│   ├── Overview Tab
│   │   ├── Organization Details
│   │   ├── Quick Stats
│   │   └── Edit Organization
│   │
│   ├── Members Tab
│   │   ├── Member List (with roles)
│   │   └── Remove Member (if owner)
│   │
│   ├── Invitations Tab
│   │   ├── Send New Invitation
│   │   ├── Pending Invitations List
│   │   └── Revoke Invitation
│   │
│   └── Subscription Tab
│       ├── Subscription Status
│       ├── Payment Methods
│       ├── Add Payment Method
│       ├── Cancel Subscription
│       └── Renew Subscription
│
├── My Invitations (Received)
│   ├── Pending Invitations List
│   ├── Organization Preview
│   ├── Accept Invitation
│   └── Decline Invitation
│
└── Create Organization
    ├── Step 1: Organization Details
    ├── Step 2: Subscription Plan (Trial Eligibility)
    ├── Step 3: Payment Method (if not trial)
    └── Step 4: Confirmation
```

---

## Route Structure

### Route Definitions

```typescript
// Public Routes
/                           → LandingPage

// Authenticated + Email Verified Routes
/organizations              → OrganizationSelectPage (select working org)
/organizations/new          → CreateOrganizationPage (multi-step wizard)
/invitations                → MyInvitationsPage (received invitations)

// Authenticated + Email Verified + Organization Selected Routes
/org/:orgId/manage          → OrganizationManagePage (tabs: overview, members, invitations, subscription)
/dashboard                  → Dashboard (requires selected org)
/inventory                  → InventoryPage (requires selected org)
/orders                     → OrdersPage (requires selected org)
```

### Route Guards

```typescript
// Existing Guards
<VerifiedRoute>             // Requires: authenticated + email verified
<OrganizationRoute>         // Requires: authenticated + email verified + selected org

// New Guards (to be created)
<OwnerRoute>                // Requires: OrganizationRoute + user is OWNER
```

### URL Parameters & Query Params

```typescript
// Organization Management
/org/:orgId/manage?tab=overview|members|invitations|subscription

// Create Organization (multi-step)
/organizations/new?step=details|plan|payment|confirm

// Redirect After Selection
/organizations?redirectTo=/dashboard
/organizations?redirectTo=/inventory
```

---

## Page Components Architecture

### 1. OrganizationSelectPage
**Purpose**: Main page for users to view and select their working organization

**Location**: `/src/pages/OrganizationSelectPage.tsx`

**Responsibilities**:
- Display all organizations user is member of
- Provide filtering by role (Owner, Manager, Staff)
- Provide search by organization name
- Handle organization selection
- Redirect to intended destination after selection
- Show empty state if no organizations
- Link to create new organization
- Link to view invitations (with badge count)

**Layout Structure**:
```tsx
<PageContainer>
  <PageHeader>
    <Title>Select Your Workspace</Title>
    <Actions>
      <Button to="/organizations/new">Create Organization</Button>
      <Button to="/invitations" badge={pendingCount}>Invitations</Button>
    </Actions>
  </PageHeader>
  
  <Filters>
    <SearchInput />
    <RoleFilter />
  </Filters>
  
  <Grid>
    {organizations.map(org => 
      <OrganizationSelectCard 
        organization={org}
        onSelect={handleSelect}
        isSelected={currentOrg?.id === org.id}
      />
    )}
  </Grid>
</PageContainer>
```

**Props**: None (uses hooks)

**Hooks Used**:
- `useOrganizations()` - fetch and manage organizations
- `useI18n()` - translations
- `useNavigate()` - redirection
- `useSearchParams()` - redirectTo handling

### 2. MyInvitationsPage
**Purpose**: Display and manage invitations received by the user

**Location**: `/src/pages/MyInvitationsPage.tsx`

**Responsibilities**:
- Display all pending invitations
- Show organization details for each invitation
- Handle invitation acceptance
- Handle invitation decline
- Show empty state if no invitations
- Display error states declaratively

**Layout Structure**:
```tsx
<PageContainer>
  <PageHeader>
    <BackButton to="/organizations" />
    <Title>My Invitations</Title>
  </PageHeader>
  
  {error && <ErrorState />}
  
  {invitations.length === 0 ? (
    <EmptyState 
      icon={Mail}
      title="No Pending Invitations"
      description="You don't have any pending invitations"
      action={{ label: "Back to Organizations", to: "/organizations" }}
    />
  ) : (
    <Grid>
      {invitations.map(invitation => 
        <InvitationCard
          invitation={invitation}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
    </Grid>
  )}
</PageContainer>
```

**Props**: None (uses hooks)

**Hooks Used**:
- `useInvitations()` - fetch and manage invitations
- `useI18n()` - translations
- `useNavigate()` - navigation after accept

### 3. CreateOrganizationPage
**Purpose**: Multi-step wizard for creating a new organization with subscription

**Location**: `/src/pages/CreateOrganizationPage.tsx`

**Responsibilities**:
- Guide user through organization creation
- Check trial eligibility
- Collect organization details
- Handle Stripe payment method collection (if not trial)
- Create subscription and organization
- Redirect to organization management after creation

**Multi-Step Flow**:

**Step 1: Organization Details**
```tsx
<StepContainer>
  <StepHeader>
    <StepIndicator current={1} total={4} />
    <Title>Organization Details</Title>
  </StepHeader>
  
  <Form>
    <Input 
      name="name"
      label="Organization Name"
      placeholder="My Bar"
    />
    
    <Select
      name="defaultCurrency"
      label="Default Currency"
      options={currencies}
    />
    
    <Button onClick={goToNextStep}>Continue</Button>
  </Form>
</StepContainer>
```

**Step 2: Subscription Plan**
```tsx
<StepContainer>
  <StepIndicator current={2} total={4} />
  <Title>Choose Your Plan</Title>
  
  {isCheckingEligibility && <Spinner />}
  
  {trialEligible ? (
    <TrialPlanCard>
      <Badge>Recommended</Badge>
      <Title>3-Month Free Trial</Title>
      <Features />
      <Button onClick={selectTrial}>Start Trial</Button>
    </TrialPlanCard>
  ) : null}
  
  <PaidPlanCard>
    <Title>Basic Plan</Title>
    <BillingIntervalToggle 
      value={billingInterval}
      onChange={setBillingInterval}
    />
    <Price interval={billingInterval} />
    <Features />
    <Button onClick={selectPaid}>Continue</Button>
  </PaidPlanCard>
</StepContainer>
```

**Step 3: Payment Method** (only if not trial)
```tsx
<StepContainer>
  <StepIndicator current={3} total={4} />
  <Title>Add Payment Method</Title>
  
  <StripeElements>
    <CardElement />
    <Button onClick={submitPayment}>Add Card</Button>
  </StripeElements>
</StepContainer>
```

**Step 4: Confirmation & Creation**
```tsx
<StepContainer>
  <StepIndicator current={4} total={4} />
  <Title>Review & Create</Title>
  
  <SummaryCard>
    <OrganizationDetails />
    <SubscriptionDetails />
    {paymentMethod && <PaymentMethodDetails />}
  </SummaryCard>
  
  {createError && <ErrorAlert error={createError} />}
  
  <Button 
    onClick={handleCreate}
    loading={isCreating}
  >
    Create Organization
  </Button>
</StepContainer>
```

**Props**: None (uses hooks and URL state)

**Hooks Used**:
- `useCreateOrganization()` - custom hook for multi-step flow
- `useTrialEligibility()` - check eligibility
- `useStripe()` - Stripe integration
- `useI18n()` - translations
- `useNavigate()` - navigation after creation

### 4. OrganizationManagePage
**Purpose**: Tabbed interface for managing owned organization

**Location**: `/src/pages/OrganizationManagePage.tsx`

**Responsibilities**:
- Display organization management tabs
- Restrict access to owners only
- Handle tab navigation
- Coordinate between tab panels

**Layout Structure**:
```tsx
<OwnerRoute> {/* Only owners can access */}
  <PageContainer>
    <PageHeader>
      <BackButton to="/organizations" />
      <Title>{organization.name}</Title>
      <Badge>{userRole}</Badge>
    </PageHeader>
    
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invitations">Invitations</TabsTrigger>
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <OrganizationOverviewTab orgId={orgId} />
      </TabsContent>
      
      <TabsContent value="members">
        <OrganizationMembersTab orgId={orgId} />
      </TabsContent>
      
      <TabsContent value="invitations">
        <OrganizationInvitationsTab orgId={orgId} />
      </TabsContent>
      
      <TabsContent value="subscription">
        <OrganizationSubscriptionTab orgId={orgId} />
      </TabsContent>
    </Tabs>
  </PageContainer>
</OwnerRoute>
```

**Props**: None (reads orgId from URL)

**Hooks Used**:
- `useParams()` - get orgId from URL
- `useSearchParams()` - get active tab
- `useOrganizationDetails()` - fetch org details
- `useI18n()` - translations

---

## Feature Components Architecture

### Organization Selection Components

#### OrganizationSelectCard
**Location**: `/src/components/features/organizations/OrganizationSelectCard.tsx`

**Purpose**: Display organization in selection list with role badge and selection state

**Props**:
```typescript
interface OrganizationSelectCardProps {
  organization: OrganizationMembership;
  onSelect: (org: OrganizationMembership) => void;
  isSelected: boolean;
}
```

**Features**:
- Shows organization name, owner, member count
- Displays user role badge (Owner/Manager/Staff)
- Visual indication of selected state
- Click to select
- Hover states for better UX

#### OrganizationFilters
**Location**: `/src/components/features/organizations/OrganizationFilters.tsx`

**Purpose**: Search and filter controls for organization list

**Props**:
```typescript
interface OrganizationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: OrgRole | 'all';
  onRoleFilterChange: (role: OrgRole | 'all') => void;
}
```

**Features**:
- Search input with debounce
- Role filter dropdown (All, Owner, Manager, Staff)
- Clear filters button
- Active filter indicators

### Organization Management Components

#### OrganizationOverviewTab
**Location**: `/src/components/features/organizations/tabs/OrganizationOverviewTab.tsx`

**Purpose**: Display organization details and allow editing

**Props**:
```typescript
interface OrganizationOverviewTabProps {
  orgId: string;
}
```

**Content**:
- Organization name (editable)
- Settings (editable): default currency
- Creation date
- Owner information
- Quick stats: member count, invitation count
- Edit organization dialog

#### OrganizationMembersTab
**Location**: `/src/components/features/organizations/tabs/OrganizationMembersTab.tsx`

**Purpose**: Display and manage organization members

**Props**:
```typescript
interface OrganizationMembersTabProps {
  orgId: string;
}
```

**Content**:
- List of all members with roles
- Member cards showing user details
- Role badges (Owner/Manager/Staff)
- Remove member button (owner only, cannot remove self)
- Empty state if no members (shouldn't happen)

**Features**:
- Fetch members via API
- Display loading skeletons
- Handle remove member action
- Confirmation dialog for removal
- Error handling

#### OrganizationInvitationsTab
**Location**: `/src/components/features/organizations/tabs/OrganizationInvitationsTab.tsx`

**Purpose**: Send and manage organization invitations (Owner/Manager)

**Props**:
```typescript
interface OrganizationInvitationsTabProps {
  orgId: string;
}
```

**Content**:
- Send invitation form (email, role)
- List of pending invitations
- Invitation cards with details (email, role, sent date, expiry)
- Revoke invitation button
- Empty state if no invitations

**Features**:
- Form for sending invitations
- Validate email format
- Prevent duplicate invitations
- Display pending invitations
- Revoke invitation with confirmation
- Auto-refresh after actions

#### OrganizationSubscriptionTab
**Location**: `/src/components/features/organizations/tabs/OrganizationSubscriptionTab.tsx`

**Purpose**: Display and manage subscription and payment methods (Owner only)

**Props**:
```typescript
interface OrganizationSubscriptionTabProps {
  orgId: string;
}
```

**Content**:
- Subscription status badge (Active, Trial, Past Due, Unpaid, Canceled)
- **Payment failure alert** (if status is Past Due or Unpaid):
  - Alert banner: "Payment failed. Please update your payment method or try again."
  - Retry payment button
  - Update payment method link
- Subscription plan details (billing interval, price)
- Trial end date (if trialing)
- Next billing date
- Auto-renewal toggle
- Payment methods list with default indicator
- Add payment method button
- Cancel subscription button (sets autoRenew to false, effective at end of billing period)
- Renew subscription button (if canceled)

**Features**:
- Fetch subscription details
- Display payment methods with card brand, last 4 digits, expiry
- Set default payment method
- Remove payment method (with confirmation)
- Add new payment method (Stripe modal)
- Cancel subscription with confirmation dialog
  - Explain: "Your subscription will remain active until [end date]. You can renew anytime before then."
- Renew canceled subscription
- Handle auto-renewal toggle
- Show payment failure state with clear actions

### Supporting Components

#### SendInvitationDialog
**Location**: `/src/components/features/organizations/SendInvitationDialog.tsx`

**Purpose**: Modal dialog for sending invitations

**Props**:
```typescript
interface SendInvitationDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features**:
- Email input with validation
- Role selector (Manager, Staff)
- Submit button
- Error display (declarative)
- Success feedback (toast)
- Auto-close on success

#### EditOrganizationDialog
**Location**: `/src/components/features/organizations/EditOrganizationDialog.tsx`

**Purpose**: Modal dialog for editing organization details

**Props**:
```typescript
interface EditOrganizationDialogProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features**:
- Name input
- Currency selector
- Validation
- Submit button
- Error display (declarative)
- Success feedback (toast)

#### AddPaymentMethodDialog
**Location**: `/src/components/features/organizations/AddPaymentMethodDialog.tsx`

**Purpose**: Modal dialog for adding payment method via Stripe Elements

**Props**:
```typescript
interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features**:
- Stripe CardElement integration
- Set as default checkbox
- Submit button
- Loading state
- Error display
- Success feedback

#### MemberCard
**Location**: `/src/components/features/organizations/MemberCard.tsx`

**Purpose**: Display member information with actions

**Props**:
```typescript
interface MemberCardProps {
  member: OrganizationMembership;
  isOwner: boolean; // Is the viewing user the owner?
  onRemove?: (memberId: string) => void;
}
```

**Features**:
- User name, email, profile picture
- Role badge
- Remove button (if isOwner and not self)
- Email verified indicator

#### PendingInvitationCard
**Location**: `/src/components/features/organizations/PendingInvitationCard.tsx`

**Purpose**: Display pending invitation with revoke action

**Props**:
```typescript
interface PendingInvitationCardProps {
  invitation: Invitation;
  onRevoke: (invitationId: string) => void;
  isRevoking: boolean;
}
```

**Features**:
- Invited email
- Role badge
- Sent date, expiry date
- Inviter name
- Revoke button
- Expired indicator

---

## State Management Strategy

### Global State (Zustand)

**OrganizationStore** (existing, no changes needed)
```typescript
interface OrganizationStore {
  // Persisted state
  currentOrg: OrganizationMembership | null;
  
  // In-memory state
  organizations: OrganizationMembership[];
  pendingInvitations: Invitation[];
  
  // Actions
  setCurrentOrg: (org: OrganizationMembership | null) => void;
  setOrganizations: (orgs: OrganizationMembership[]) => void;
  setPendingInvitations: (invites: Invitation[]) => void;
  clearOrganizationData: () => void;
}
```

### Server State (TanStack Query)

**Query Keys**:
```typescript
// Organizations
['organizations']                              // All orgs user is member of
['organizations', role]                        // Filtered by role
['organization', orgId]                        // Single org details
['organization', orgId, 'members']             // Org members
['organization', orgId, 'invitations']         // Org pending invitations
['organization', orgId, 'subscription']        // Org subscription details

// Invitations
['invitations']                                // User's pending invitations

// Subscriptions
['subscriptions']                              // User's subscriptions
['trial-eligibility']                          // Trial eligibility check
['subscription-plans']                         // Available plans

// Payment Methods
['payment-methods']                            // User's payment methods
```

**Invalidation Strategy**:
```typescript
// After accepting invitation
invalidateQueries(['organizations'])           // Refresh org list
invalidateQueries(['invitations'])             // Refresh invitations

// After creating organization
invalidateQueries(['organizations'])           // Refresh org list
invalidateQueries(['subscriptions'])           // Refresh subscriptions

// After sending invitation
invalidateQueries(['organization', orgId, 'invitations'])

// After revoking invitation
invalidateQueries(['organization', orgId, 'invitations'])

// After adding payment method
invalidateQueries(['payment-methods'])
invalidateQueries(['organization', orgId, 'subscription'])

// After canceling subscription
invalidateQueries(['organization', orgId, 'subscription'])
invalidateQueries(['subscriptions'])
```

### Local Component State (useState)

**Use for**:
- Form inputs (controlled components)
- UI state (dialog open/closed, active tab)
- Temporary filters (search query, role filter)
- Multi-step wizard progress

**Don't use for**:
- Data that should persist across components
- Data that should sync across tabs/windows
- Data that comes from the server

---

## API Integration Layer

### New API Methods to Implement

#### Organization API Extensions
**Location**: `/src/api/organization-api.ts`

```typescript
// Already exists, add these methods:

/**
 * Get organization members
 * @param orgId Organization ID
 * @returns List of organization memberships
 */
getOrganizationMembers: (orgId: string): Promise<OrganizationMembership[]> => {
  return apiClient.request<OrganizationMembership[]>(
    `/orgs/${orgId}/members`,
    { method: 'GET' },
    z.array(OrganizationMembershipSchema),
  );
},

/**
 * Update organization details
 * @param orgId Organization ID
 * @param data Updated organization data
 * @returns Updated organization
 */
updateOrganization: (
  orgId: string, 
  data: UpdateOrganizationRequest
): Promise<Organization> => {
  return apiClient.request<Organization>(
    `/orgs/${orgId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    OrganizationSchema,
  );
},

/**
 * Delete organization (owner only)
 * @param orgId Organization ID
 * @returns void
 */
deleteOrganization: (orgId: string): Promise<void> => {
  return apiClient.request<void>(
    `/orgs/${orgId}`,
    { method: 'DELETE' },
    z.void(),
  );
},

/**
 * Remove member from organization (owner only)
 * @param orgId Organization ID
 * @param userId User ID to remove
 * @returns void
 */
removeMember: (orgId: string, userId: string): Promise<void> => {
  return apiClient.request<void>(
    `/orgs/${orgId}/members/${userId}`,
    { method: 'DELETE' },
    z.void(),
  );
},
```

#### Invitation API Extensions
**Location**: `/src/api/invitation-api.ts`

```typescript
// Already exists, add these methods:

/**
 * Get pending invitations for an organization (owner/manager)
 * @param orgId Organization ID
 * @returns List of pending invitations
 */
getOrganizationInvitations: (orgId: string): Promise<Invitation[]> => {
  return apiClient.request<Invitation[]>(
    `/orgs/${orgId}/invitations`,
    { method: 'GET' },
    z.array(InvitationSchema),
  );
},

/**
 * Send invitation to join organization (owner/manager)
 * @param orgId Organization ID
 * @param data Invitation data (email, role)
 * @returns Created invitation
 */
sendInvitation: (
  orgId: string, 
  data: CreateInvitationRequest
): Promise<Invitation> => {
  return apiClient.request<Invitation>(
    `/orgs/${orgId}/invitations`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    InvitationSchema,
  );
},

/**
 * Revoke pending invitation (owner/manager)
 * @param orgId Organization ID
 * @param invitationId Invitation ID
 * @returns Updated invitation
 */
revokeInvitation: (
  orgId: string, 
  invitationId: string
): Promise<Invitation> => {
  return apiClient.request<Invitation>(
    `/orgs/${orgId}/invitations/${invitationId}`,
    { method: 'DELETE' },
    InvitationSchema,
  );
},
```

#### Subscription API Extensions
**Location**: `/src/api/subscription-api.ts`

```typescript
// Already exists, add these methods:

/**
 * Get organization subscription details
 * @param orgId Organization ID
 * @returns Subscription details
 */
getOrganizationSubscription: (orgId: string): Promise<Subscription> => {
  return apiClient.request<Subscription>(
    `/orgs/${orgId}/subscription`,
    { method: 'GET' },
    SubscriptionSchema,
  );
},

/**
 * Cancel subscription (owner only)
 * @param subscriptionId Subscription ID
 * @returns Updated subscription
 */
cancelSubscription: (subscriptionId: string): Promise<Subscription> => {
  return apiClient.request<Subscription>(
    `/subscriptions/${subscriptionId}/cancel`,
    { method: 'POST' },
    SubscriptionSchema,
  );
},

/**
 * Renew subscription (owner only)
 * @param subscriptionId Subscription ID
 * @returns Updated subscription
 */
renewSubscription: (subscriptionId: string): Promise<Subscription> => {
  return apiClient.request<Subscription>(
    `/subscriptions/${subscriptionId}/renew`,
    { method: 'POST' },
    SubscriptionSchema,
  );
},

/**
 * Update subscription auto-renewal (owner only)
 * @param subscriptionId Subscription ID
 * @param autoRenew Auto-renewal setting
 * @returns Updated subscription
 */
updateAutoRenewal: (
  subscriptionId: string, 
  autoRenew: boolean
): Promise<Subscription> => {
  return apiClient.request<Subscription>(
    `/subscriptions/${subscriptionId}/auto-renew`,
    {
      method: 'PUT',
      body: JSON.stringify({ autoRenew }),
    },
    SubscriptionSchema,
  );
},
```

#### Payment Methods API (New File)
**Location**: `/src/api/payment-api.ts`

```typescript
import { apiClient } from '@/api/api';
import { z } from 'zod';
import {
  PaymentMethodSchema,
  type PaymentMethod,
  type AddPaymentMethodRequest,
} from '@/types/payment';

export const paymentApi = {
  /**
   * Get user's payment methods
   * @returns List of payment methods
   */
  getPaymentMethods: (): Promise<PaymentMethod[]> => {
    return apiClient.request<PaymentMethod[]>(
      '/payment/methods',
      { method: 'GET' },
      z.array(PaymentMethodSchema),
    );
  },

  /**
   * Add new payment method
   * @param data Payment method data (Stripe paymentMethodId)
   * @returns Created payment method
   */
  addPaymentMethod: (data: AddPaymentMethodRequest): Promise<PaymentMethod> => {
    return apiClient.request<PaymentMethod>(
      '/payment/methods',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      PaymentMethodSchema,
    );
  },

  /**
   * Remove payment method
   * @param paymentMethodId Payment method ID
   * @returns void
   */
  removePaymentMethod: (paymentMethodId: string): Promise<void> => {
    return apiClient.request<void>(
      `/payment/methods/${paymentMethodId}`,
      { method: 'DELETE' },
      z.void(),
    );
  },

  /**
   * Set default payment method
   * @param paymentMethodId Payment method ID
   * @returns void
   */
  setDefaultPaymentMethod: (paymentMethodId: string): Promise<void> => {
    return apiClient.request<void>(
      '/payment/methods/default',
      {
        method: 'POST',
        body: JSON.stringify({ paymentMethodId }),
      },
      z.void(),
    );
  },
};
```

---

## Type System & Validation

### New Type Definitions

#### Payment Types
**Location**: `/src/types/payment.ts`

```typescript
import { z } from 'zod';

/**
 * Payment method card details schema
 */
export const PaymentMethodCardSchema = z.object({
  brand: z.string(), // visa, mastercard, amex, etc.
  last4: z.string().length(4),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int(),
});

/**
 * Payment method schema
 */
export const PaymentMethodSchema = z.object({
  id: z.string(), // Stripe payment method ID
  type: z.string(), // 'card', etc.
  card: PaymentMethodCardSchema,
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
});

/**
 * Add payment method request schema
 */
export const AddPaymentMethodRequestSchema = z.object({
  paymentMethodId: z.string(), // From Stripe.js
  setAsDefault: z.boolean().optional().default(false),
});

// TypeScript types
export type PaymentMethodCard = z.infer<typeof PaymentMethodCardSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type AddPaymentMethodRequest = z.infer<typeof AddPaymentMethodRequestSchema>;
```

#### Organization Update Types
**Location**: `/src/types/organization.ts` (add to existing file)

```typescript
/**
 * Update organization request schema
 */
export const UpdateOrganizationRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  settings: OrgSettingsSchema.partial().optional(),
});

export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationRequestSchema>;
```

---

## Navigation & UX Flow

### User Journey: Selecting Working Organization

```
User logs in
  ↓
Dashboard (OrganizationRoute)
  ↓ (if no selected org)
Redirected to /organizations?redirectTo=/dashboard
  ↓
OrganizationSelectPage
  - View all organizations
  - Filter by role
  - Search by name
  ↓
User selects organization
  ↓
Organization stored in global state (persisted)
  ↓
Redirected to /dashboard
  ↓
Dashboard loads with selected organization context
```

### User Journey: Creating Organization

```
User on OrganizationSelectPage
  ↓
Clicks "Create Organization"
  ↓
Redirected to /organizations/new
  ↓
Step 1: Enter organization name
  ↓
Step 2: Trial eligibility check
  - If eligible: show trial option (3 months free)
  - If not eligible: show paid plan only
  ↓
User selects plan & billing interval
  ↓
Step 3: Payment method (if not trial)
  - Stripe Elements card input
  - User enters card details
  - Stripe creates payment method token
  ↓
Step 4: Review & confirm
  - Show summary
  - User clicks "Create Organization"
  ↓
API calls:
  1. Create subscription (trial or paid)
  2. Create organization (with subscription ID)
  ↓
Success:
  - Organization added to user's list
  - Organization auto-selected
  - Redirected to /org/:orgId/manage?tab=invitations
  ↓
User can invite team members
```

### User Journey: Managing Owned Organization

```
User on Dashboard
  ↓
Clicks "Manage Organization" in user menu
  ↓
Redirected to /org/:orgId/manage
  ↓
OrganizationManagePage (Owner only)
  ↓
Tabs:
  1. Overview
     - Edit org name
     - Edit settings
     - View quick stats
  
  2. Members
     - View all members
     - Remove members
  
  3. Invitations
     - Send new invitations
     - View pending invitations
     - Revoke invitations
  
  4. Subscription
     - View subscription status
     - View payment methods
     - Add payment method
     - Set default payment method
     - Remove payment method
     - Cancel subscription
     - Renew subscription
```

### User Journey: Accepting Invitation

```
User receives email invitation
  ↓
Clicks link in email
  ↓
If not authenticated:
  - Redirected to /auth/login?redirectTo=/invitations
  - User logs in or registers
  - Email verification required
  ↓
If authenticated:
  - Redirected to /invitations
  ↓
MyInvitationsPage
  - View all pending invitations
  - See organization details
  - See who invited them
  ↓
User clicks "Accept" on invitation
  ↓
API call: POST /invites/:id/accept
  ↓
Success:
  - Invitation removed from list
  - Organization added to user's list
  - Toast: "Invitation accepted successfully"
  - Organization auto-selected
  - Redirected to /dashboard
```

---

## Subscription & Payment Integration

### Stripe Elements Integration

#### Setup
```typescript
// Install dependencies
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Stripe Provider Setup
**Location**: `/src/components/StripeProvider.tsx`

```typescript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { PropsWithChildren } from 'react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const StripeProvider: React.FC<PropsWithChildren> = ({ children }) => 
{
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};
```

#### Payment Method Collection Component
**Location**: `/src/components/features/organizations/PaymentMethodForm.tsx`

```typescript
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/hooks/useI18n';

interface PaymentMethodFormProps {
  onSuccess: (paymentMethodId: string, setAsDefault: boolean) => void;
  onError: (error: Error) => void;
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  onSuccess,
  onError,
}) => 
{
  const { t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => 
  {
    e.preventDefault();

    if (!stripe || !elements) 
    {
      return;
    }

    setIsProcessing(true);

    try 
    {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) 
      {
        throw new Error('Card element not found');
      }

      // Create payment method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) 
      {
        throw new Error(error.message);
      }

      onSuccess(paymentMethod.id, setAsDefault);
    } 
    catch (error) 
    {
      onError(error as Error);
    } 
    finally 
    {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('payment.cardDetails')}</Label>
        <div className="p-3 border border-border rounded-lg bg-input">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'hsl(var(--foreground))',
                  '::placeholder': {
                    color: 'hsl(var(--muted-foreground))',
                  },
                },
                invalid: {
                  color: 'hsl(var(--destructive))',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="setAsDefault"
          checked={setAsDefault}
          onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
        />
        <Label htmlFor="setAsDefault" className="cursor-pointer">
          {t('payment.setAsDefault')}
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? t('payment.processing') : t('payment.addCard')}
      </Button>
    </form>
  );
};
```

### Subscription Status Display

#### Subscription Status Badge
**Location**: `/src/components/features/organizations/SubscriptionStatusBadge.tsx`

```typescript
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import type { SubscriptionStatus } from '@/types/subscription';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({ 
  status 
}) => 
{
  const { t } = useI18n();

  const getVariant = (status: SubscriptionStatus) => 
  {
    switch (status) 
    {
      case 'ACTIVE':
      case 'TRIALING':
        return 'default';
      case 'PAST_DUE':
      case 'UNPAID':
        return 'destructive';
      case 'CANCELED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {t(`subscription.status.${status.toLowerCase()}`)}
    </Badge>
  );
};
```

---

## Localization Strategy

### New Translation Keys

Add to `/src/locales/en/translation.json` and `/src/locales/it/translation.json`:

```json
{
  "organizationManagement": {
    "title": "Manage Organization",
    "tabs": {
      "overview": "Overview",
      "members": "Members",
      "invitations": "Invitations",
      "subscription": "Subscription"
    },
    "overview": {
      "title": "Organization Details",
      "editOrganization": "Edit Organization",
      "organizationName": "Organization Name",
      "defaultCurrency": "Default Currency",
      "createdOn": "Created On",
      "owner": "Owner",
      "quickStats": "Quick Stats",
      "memberCount": "{{count}} member",
      "memberCount_plural": "{{count}} members",
      "invitationCount": "{{count}} pending invitation",
      "invitationCount_plural": "{{count}} pending invitations"
    },
    "members": {
      "title": "Members",
      "noMembers": "No members",
      "removeMember": "Remove Member",
      "confirmRemove": "Are you sure you want to remove {{name}} from this organization?",
      "cannotRemoveSelf": "You cannot remove yourself",
      "removeSuccess": "Member removed successfully",
      "removeError": "Failed to remove member"
    },
    "invitations": {
      "title": "Invitations",
      "sendInvitation": "Send Invitation",
      "noPendingInvitations": "No pending invitations",
      "showExpired": "Show Expired Invitations",
      "hideExpired": "Hide Expired Invitations",
      "invitedEmail": "Email",
      "role": "Role",
      "sentOn": "Sent On",
      "expiresOn": "Expires On",
      "revokeInvitation": "Revoke",
      "confirmRevoke": "Are you sure you want to revoke this invitation?",
      "sendSuccess": "Invitation sent successfully",
      "sendError": "Failed to send invitation",
      "revokeSuccess": "Invitation revoked successfully",
      "revokeError": "Failed to revoke invitation"
    },
    "subscription": {
      "title": "Subscription",
      "status": "Status",
      "plan": "Plan",
      "billingInterval": "Billing Interval",
      "nextBillingDate": "Next Billing Date",
      "trialEndsOn": "Trial Ends On",
      "activeUntil": "Active Until",
      "autoRenew": "Auto-Renewal",
      "enabled": "Enabled",
      "disabled": "Disabled",
      "paymentMethods": "Payment Methods",
      "addPaymentMethod": "Add Payment Method",
      "noPaymentMethods": "No payment methods",
      "defaultMethod": "Default",
      "setAsDefault": "Set as Default",
      "removePaymentMethod": "Remove",
      "confirmRemovePaymentMethod": "Are you sure you want to remove this payment method?",
      "cancelSubscription": "Cancel Subscription",
      "confirmCancel": "Are you sure you want to cancel your subscription? It will remain active until {{endDate}}.",
      "renewSubscription": "Renew Subscription",
      "cancelSuccess": "Subscription cancelled successfully. Active until {{endDate}}.",
      "cancelError": "Failed to cancel subscription",
      "renewSuccess": "Subscription renewed successfully",
      "renewError": "Failed to renew subscription",
      "paymentFailed": {
        "title": "Payment Failed",
        "description": "Your payment method was declined. Please update your payment method or try again.",
        "retryPayment": "Retry Payment",
        "updatePaymentMethod": "Update Payment Method",
        "cardDeclined": "Your card was declined. Please try a different payment method.",
        "insufficientFunds": "Payment failed due to insufficient funds.",
        "generic": "Payment failed. Please update your payment method or try again.",
        "accessUntil": "Access until {{date}} if payment not received"
      }
    }
  },
  "payment": {
    "cardDetails": "Card Details",
    "setAsDefault": "Set as default payment method",
    "addCard": "Add Card",
    "processing": "Processing...",
    "cardBrand": {
      "visa": "Visa",
      "mastercard": "Mastercard",
      "amex": "American Express",
      "discover": "Discover",
      "unknown": "Card"
    },
    "expiresOn": "Expires {{month}}/{{year}}",
    "endingIn": "•••• {{last4}}"
  },
  "createOrganization": {
    "title": "Create New Organization",
    "step": "Step {{current}} of {{total}}",
    "steps": {
      "details": "Details",
      "plan": "Plan",
      "payment": "Payment",
      "confirm": "Confirm"
    },
    "details": {
      "title": "Organization Details",
      "description": "Enter the basic information for your organization",
      "organizationName": "Organization Name",
      "organizationNamePlaceholder": "My Bar",
      "defaultCurrency": "Default Currency",
      "continue": "Continue"
    },
    "plan": {
      "title": "Choose Your Plan",
      "description": "Select the subscription plan that works best for you",
      "checkingEligibility": "Checking eligibility...",
      "trial": {
        "title": "Free Trial",
        "duration": "3 months free",
        "description": "Full access to all features",
        "badge": "Recommended",
        "select": "Start Free Trial"
      },
      "basic": {
        "title": "Basic Plan",
        "monthly": "Monthly",
        "yearly": "Yearly",
        "price": "€{{price}}/{{interval}}",
        "description": "Full access to all features",
        "select": "Continue"
      }
    },
    "payment": {
      "title": "Payment Method",
      "description": "Add a payment method to continue",
      "secureNotice": "Your payment information is secure and encrypted"
    },
    "confirm": {
      "title": "Review & Create",
      "description": "Review your organization details before creating",
      "organizationDetails": "Organization Details",
      "subscriptionDetails": "Subscription Details",
      "paymentDetails": "Payment Method",
      "create": "Create Organization",
      "creating": "Creating..."
    }
  }
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
**Goal**: Set up foundation for organization management

**Tasks**:
1. Create new route guards (OwnerRoute)
2. Add new API methods (organization, invitation, payment)
3. Create new types (payment, organization updates)
4. Set up Stripe provider
5. Update query keys and invalidation logic

**Deliverables**:
- OwnerRoute component
- Extended API methods
- Payment types
- Stripe integration setup

### Phase 2: Organization Selection (Week 2)
**Goal**: Replace existing OrganizationsPage with new OrganizationSelectPage

**Tasks**:
1. Create OrganizationSelectPage
2. Create OrganizationSelectCard component
3. Create OrganizationFilters component
4. Implement search and filter logic
5. Add navigation to create org and invitations
6. Add localization keys

**Deliverables**:
- OrganizationSelectPage (replaces OrganizationsPage)
- Filter and search functionality
- Mobile-responsive design

### Phase 3: Invitations Management (Week 2)
**Goal**: Implement received invitations page

**Tasks**:
1. Create MyInvitationsPage
2. Update InvitationCard for received invitations
3. Implement accept/decline logic
4. Add empty states
5. Add error handling

**Deliverables**:
- MyInvitationsPage
- Accept/Decline functionality
- Proper error handling

### Phase 4: Organization Management Tabs (Week 3-4)
**Goal**: Implement organization management interface

**Tasks**:
1. Create OrganizationManagePage
2. Create tab components:
   - OrganizationOverviewTab
   - OrganizationMembersTab
   - OrganizationInvitationsTab
   - OrganizationSubscriptionTab
3. Create supporting components:
   - EditOrganizationDialog
   - SendInvitationDialog
   - MemberCard
   - PendingInvitationCard
4. Implement all CRUD operations
5. Add localization keys

**Deliverables**:
- Complete organization management interface
- All tabs functional
- Owner-only restrictions enforced

### Phase 5: Subscription & Payment (Week 5)
**Goal**: Implement subscription management and payment methods

**Tasks**:
1. Create OrganizationSubscriptionTab
2. Create AddPaymentMethodDialog
3. Implement Stripe Elements integration
4. Add payment method management
5. Add subscription cancellation/renewal
6. Create SubscriptionStatusBadge

**Deliverables**:
- Payment method management
- Stripe integration
- Subscription control

### Phase 6: Organization Creation Wizard (Week 6)
**Goal**: Implement multi-step organization creation flow

**Tasks**:
1. Create CreateOrganizationPage
2. Implement step navigation
3. Create trial eligibility check
4. Integrate Stripe payment collection
5. Handle organization creation
6. Add validation and error handling

**Deliverables**:
- Multi-step organization creation
- Trial eligibility handling
- Stripe payment integration
- Complete validation

### Phase 7: Polish & Testing (Week 7)
**Goal**: Refine UX and ensure quality

**Tasks**:
1. Add loading states everywhere
2. Add skeleton loaders
3. Improve error messages
4. Add confirmation dialogs
5. Test all flows end-to-end
6. Mobile responsiveness testing
7. Accessibility audit
8. Performance optimization

**Deliverables**:
- Polished UX
- Complete loading states
- Comprehensive error handling
- Mobile-optimized
- Accessible

---

## Testing Strategy

### Unit Tests
**Focus**: Individual components and hooks

**Test Cases**:
- Component rendering with different props
- User interactions (clicks, form inputs)
- Hook return values and mutations
- Error state handling
- Loading state handling

**Example**:
```typescript
describe('OrganizationSelectCard', () => {
  it('renders organization name', () => {
    render(<OrganizationSelectCard organization={mockOrg} />);
    expect(screen.getByText(mockOrg.org.name)).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<OrganizationSelectCard organization={mockOrg} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockOrg);
  });

  it('shows selected state', () => {
    render(<OrganizationSelectCard organization={mockOrg} isSelected={true} />);
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });
});
```

### Integration Tests
**Focus**: Component interactions and API integration

**Test Cases**:
- Organization selection flow
- Invitation acceptance flow
- Organization creation flow
- Subscription management flow
- Payment method management flow

### E2E Tests
**Focus**: Complete user journeys

**Test Cases**:
1. User logs in → selects organization → navigates to dashboard
2. User creates new organization → adds payment method → invites team
3. User accepts invitation → joins organization → views dashboard
4. Owner manages members → sends invitation → revokes invitation
5. Owner manages subscription → adds payment method → cancels subscription

---

## Migration Strategy

### Removing OrganizationsPage

**Current State**:
- `/organizations` → `OrganizationsPage` (combined selection + invitations)

**New State**:
- `/organizations` → `OrganizationSelectPage` (selection only)
- `/invitations` → `MyInvitationsPage` (invitations only)
- `/organizations/new` → `CreateOrganizationPage` (creation wizard)
- `/org/:orgId/manage` → `OrganizationManagePage` (management tabs)

**Migration Steps**:

1. **Create new pages** (do not modify existing OrganizationsPage)
   - Build all new pages and components
   - Test thoroughly
   - Ensure feature parity

2. **Update routing** (atomic swap)
   ```typescript
   // Before
   <Route path="/organizations" element={<OrganizationsPage />} />

   // After
   <Route path="/organizations" element={<OrganizationSelectPage />} />
   <Route path="/organizations/new" element={<CreateOrganizationPage />} />
   <Route path="/invitations" element={<MyInvitationsPage />} />
   <Route path="/org/:orgId/manage" element={<OrganizationManagePage />} />
   ```

3. **Delete old code**
   - Remove `OrganizationsPage.tsx`
   - Remove `CreateOrganizationDialog.tsx` (replaced by full page)
   - Keep `OrganizationCard.tsx` and `InvitationCard.tsx` (reusable)

4. **Update navigation links**
   - User menu: "Manage Organization" → `/org/:orgId/manage`
   - Navigation: "Organizations" → `/organizations`
   - Invitation badge: `/invitations`

---

## Conclusion

This architecture plan provides a comprehensive, production-ready approach to implementing organization management features in the Barback frontend. The design prioritizes:

✅ **User Experience**: Clear navigation, intuitive workflows, proper feedback
✅ **Code Quality**: Type safety, reusable components, proper abstractions
✅ **Performance**: Optimistic updates, efficient caching, minimal re-renders
✅ **Maintainability**: Clear separation of concerns, consistent patterns
✅ **Accessibility**: Mobile-first, keyboard navigation, screen reader support
✅ **Internationalization**: Full localization support

The phased implementation approach allows for incremental development and testing, ensuring each feature is solid before moving to the next.

**Next Steps**:
1. Review and approve this architecture plan
2. Begin Phase 1 implementation
3. Regular progress reviews after each phase
4. Iterative refinement based on feedback
