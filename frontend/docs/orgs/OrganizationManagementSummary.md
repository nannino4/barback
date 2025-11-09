# Organization Management - Implementation Summary

## Quick Reference

This document provides a high-level overview of the organization management architecture. For full details, see [OrganizationManagementArchitecture.md](./OrganizationManagementArchitecture.md).

---

## Architecture Overview

### Current State
- Single `OrganizationsPage` handles both organization selection and invitation management
- Limited organization management capabilities
- No subscription management UI
- No payment method management

### Target State
**4 Main Pages + Supporting Components**:
1. **OrganizationSelectPage** - Select working organization
2. **MyInvitationsPage** - Manage received invitations
3. **CreateOrganizationPage** - Multi-step wizard with Stripe integration
4. **OrganizationManagePage** - Tabbed interface for owners (overview, members, invitations, subscription)

---

## Route Structure

```
/organizations              → OrganizationSelectPage (selection)
/organizations/new          → CreateOrganizationPage (creation wizard)
/invitations                → MyInvitationsPage (received invitations)
/org/:orgId/manage          → OrganizationManagePage (owner management)
  ?tab=overview|members|invitations|subscription
```

---

## Key Features by Page

### 1. OrganizationSelectPage
- View all organizations user is member of
- Filter by role (Owner, Manager, Staff)
- Search by organization name
- Select working organization
- Quick links to create org and view invitations

### 2. MyInvitationsPage
- View all pending invitations
- See organization details and who invited you
- Accept or decline invitations
- Empty state when no invitations

### 3. CreateOrganizationPage (Multi-Step Wizard)
- **Step 1**: Organization details (name, currency)
- **Step 2**: Plan selection (trial eligibility check, billing interval)
- **Step 3**: Payment method (Stripe Elements - if not trial)
- **Step 4**: Review & create

### 4. OrganizationManagePage (Owner Only)
- **Overview Tab**: Edit org details, view quick stats
- **Members Tab**: View/remove members
- **Invitations Tab**: Send/revoke invitations
- **Subscription Tab**: Manage subscription and payment methods

---

## Technical Implementation

### New API Methods Needed

**Organization API** (`organization-api.ts`):
- `getOrganizationMembers(orgId)` - Get members list
- `updateOrganization(orgId, data)` - Update org details
- `deleteOrganization(orgId)` - Delete org (owner only)
- `removeMember(orgId, userId)` - Remove member (owner only)

**Invitation API** (`invitation-api.ts`):
- `getOrganizationInvitations(orgId)` - Get org's pending invitations
- `sendInvitation(orgId, data)` - Send new invitation
- `revokeInvitation(orgId, invitationId)` - Revoke invitation

**Subscription API** (`subscription-api.ts`):
- `getOrganizationSubscription(orgId)` - Get subscription details
- `cancelSubscription(subscriptionId)` - Cancel subscription
- `renewSubscription(subscriptionId)` - Renew cancelled subscription
- `updateAutoRenewal(subscriptionId, autoRenew)` - Toggle auto-renewal

**Payment API** (`payment-api.ts` - NEW FILE):
- `getPaymentMethods()` - Get user's payment methods
- `addPaymentMethod(data)` - Add new payment method
- `removePaymentMethod(paymentMethodId)` - Remove payment method
- `setDefaultPaymentMethod(paymentMethodId)` - Set default

### New Types Needed

**Payment Types** (`types/payment.ts` - NEW FILE):
```typescript
PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: string;
}
```

**Organization Update** (add to `types/organization.ts`):
```typescript
UpdateOrganizationRequest {
  name?: string;
  settings?: Partial<OrgSettings>;
}
```

### Stripe Integration

**Setup**:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Provider** (add to `App.tsx`):
```tsx
import { StripeProvider } from '@/components/StripeProvider';

<StripeProvider>
  <QueryClientProvider client={queryClient}>
    {/* app content */}
  </QueryClientProvider>
</StripeProvider>
```

**Environment Variable**:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Component Structure

### Reusable Components
```
features/organizations/
├── OrganizationSelectCard.tsx       # Org selection card with role badge
├── OrganizationFilters.tsx          # Search + role filter
├── MemberCard.tsx                   # Member display with remove action
├── PendingInvitationCard.tsx        # Pending invitation with revoke
├── SendInvitationDialog.tsx         # Modal to send invitation
├── EditOrganizationDialog.tsx       # Modal to edit org details
├── AddPaymentMethodDialog.tsx       # Modal with Stripe Elements
├── PaymentMethodForm.tsx            # Stripe CardElement form
├── SubscriptionStatusBadge.tsx      # Status badge (Active, Trial, etc.)
└── tabs/
    ├── OrganizationOverviewTab.tsx
    ├── OrganizationMembersTab.tsx
    ├── OrganizationInvitationsTab.tsx
    └── OrganizationSubscriptionTab.tsx
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- Route guards (OwnerRoute)
- API methods (organization, invitation, payment)
- Types (payment, updates)
- Stripe provider setup

### Phase 2: Organization Selection (Week 2)
- OrganizationSelectPage
- Filters and search
- Replace existing OrganizationsPage

### Phase 3: Invitations Management (Week 2)
- MyInvitationsPage
- Accept/decline functionality

### Phase 4: Organization Management (Week 3-4)
- OrganizationManagePage
- All 4 tabs (overview, members, invitations, subscription)
- Supporting dialogs

### Phase 5: Subscription & Payment (Week 5)
- Subscription tab fully functional
- Payment method management
- Stripe integration complete

### Phase 6: Organization Creation (Week 6)
- CreateOrganizationPage wizard
- Trial eligibility
- Stripe payment collection

### Phase 7: Polish & Testing (Week 7)
- Loading states
- Error handling
- Mobile optimization
- Accessibility
- E2E tests

---

## Migration Strategy

**Do NOT modify existing OrganizationsPage until ready**:

1. Build all new pages in parallel
2. Test thoroughly
3. Update routes (atomic swap)
4. Delete old code

**Files to Remove**:
- `pages/OrganizationsPage.tsx`
- `components/features/organizations/CreateOrganizationDialog.tsx`

**Files to Keep/Reuse**:
- `OrganizationCard.tsx` (can be adapted)
- `InvitationCard.tsx` (can be reused)
- `OrganizationCardSkeleton.tsx` (loading states)

---

## State Management

### Global State (Zustand)
- `currentOrg` - Selected organization (persisted)
- `organizations` - User's organization list (in-memory)
- `pendingInvitations` - User's invitations (in-memory)

### Server State (TanStack Query)
```typescript
// Query Keys
['organizations']                              // All orgs
['organizations', role]                        // Filtered by role
['organization', orgId]                        // Single org
['organization', orgId, 'members']             // Members
['organization', orgId, 'invitations']         // Invitations
['organization', orgId, 'subscription']        // Subscription
['invitations']                                // User invitations
['payment-methods']                            // Payment methods
['trial-eligibility']                          // Trial check
```

---

## Localization

**New Translation Namespaces**:
- `organizationManagement.*` - Management page translations
- `payment.*` - Payment-related translations
- `createOrganization.*` - Creation wizard translations

**Files to Update**:
- `locales/en/translation.json`
- `locales/it/translation.json`

---

## Testing

### Unit Tests
- Component rendering
- User interactions
- Hook behavior
- Error/loading states

### Integration Tests
- API integration
- Multi-component flows
- State updates

### E2E Tests
- Complete user journeys
- Organization creation flow
- Invitation acceptance flow
- Subscription management flow

---

## Coding Guidelines Compliance

✅ **Allman Brace Style** - All components use braces on new lines
✅ **No `any` Type** - Strict typing throughout
✅ **CSS Variables** - No `dark:` variants, use theme variables
✅ **Declarative Error Handling** - Display errors in JSX, not toasts
✅ **Localization** - All text uses i18n keys
✅ **Promise Handling** - Use `void` operator for fire-and-forget
✅ **Import Patterns** - Use `@/` alias for all internal imports

---

## Security Considerations

- Only owners can access `/org/:orgId/manage`
- Only owners/managers can send invitations
- Payment information handled by Stripe (PCI compliant)
- No sensitive data in localStorage (only persisting currentOrg ID)
- All API calls require authentication
- Email verification required for org management

---

## Performance Considerations

- Optimistic updates for instant feedback
- Query caching with proper invalidation
- Skeleton loaders for better perceived performance
- Debounced search input
- Lazy loading for modals/dialogs
- Minimal re-renders with proper memoization

---

## Next Steps

1. **Review architecture plan** - Team review and feedback
2. **Set up Stripe test account** - Get test keys
3. **Create development branches** - Feature branches for each phase
4. **Begin Phase 1** - Start with infrastructure
5. **Iterative development** - Build, test, refine each phase
6. **Staging deployment** - Test in staging before production
7. **Production rollout** - Gradual rollout with monitoring

---

## Questions to Address Before Starting

1. **Stripe Account**: Do we have Stripe test/production keys?
2. **Member Removal**: Should owners be able to remove themselves?
3. **Subscription Cancellation**: Immediate or end of billing period?
4. **Organization Deletion**: Should this be allowed? What happens to members?
5. **Invitation Expiry**: Should we auto-clean expired invitations?
6. **Payment Failure**: What's the UX for failed payments?
7. **Multiple Subscriptions**: Can users have multiple active subscriptions?

---

For complete details, implementation guidelines, and code examples, see:
**[OrganizationManagementArchitecture.md](./OrganizationManagementArchitecture.md)**
