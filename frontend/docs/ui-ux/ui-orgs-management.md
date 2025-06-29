# Organization Management UI Specifications

## Overview

The organization management system handles the creation, selection, and administration of organizations, including subscription management and member invitations.

## Organization States & User Contexts

### User Organization Relationships
1. **Owner**: User owns the organization (via subscription)
2. **Member**: User is a member of organization (invited and accepted)
3. **Invited**: User has pending invitation to organization
4. **No Organizations**: New user needs to create or be invited

## Organization Dashboard (`/organizations`)

### Mobile Layout - Organization Overview
```
┌─────────────────────────────────┐
│ ← Back    Organizations    +   │ ← Header with add button
├─────────────────────────────────┤
│ Owned │ Member │ Invites        │ ← Tab navigation
│   •                             │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🍸 The Golden Hour       │     │ ← Organization card (owned)
│ │ Owner • 5 members        │     │   Shows role and member count
│ │ Active subscription      │     │   Subscription status
│ │ ──────────────────────   │     │
│ │ Last activity: 2h ago    │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🍹 Moonlight Lounge      │     │ ← Organization card (owned)
│ │ Owner • 3 members        │     │
│ │ Trial ends in 12 days    │     │ ← Trial status warning
│ │ ──────────────────────   │     │
│ │ Last activity: 1d ago    │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ⚡ Create New Organization│     │ ← CTA for new org
│ │ Start fresh with your    │     │   (requires subscription)
│ │ own bar inventory        │     │
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Components Used
```tsx
<OrganizationDashboard />
├── <TabNavigation>
│   ├── <Tab id="owned">Owned</Tab>
│   ├── <Tab id="member">Member</Tab>
│   └── <Tab id="invites">Invites</Tab>
├── <TabContent>
│   ├── <OwnedOrganizationsTab>
│   │   ├── <OwnedOrganizationCard />
│   │   └── <CreateOrganizationCTA />
│   ├── <MemberOrganizationsTab>
│   │   └── <MemberOrganizationCard />
│   └── <InvitationsTab>
│       └── <InvitationCard />
└── <CreateOrganizationCTA />
```
│   └── <InvitationCard />
│       ├── <InvitationHeader orgName invitedRole inviterName />
│       └── <InvitationActions onAccept onDecline />
└── <CreateOrganizationCTA />
```

## Organization Creation Flow

**Prerequisites**: Users must have verified their email address and selected an active subscription before creating an organization.

### Step 1: Subscription Selection (`/organizations/create/subscription`)
**Note**: This step is required for all new organizations. Users cannot proceed without an active subscription.
```
┌─────────────────────────────────┐
│ ← Back    Create Organization   │
├─────────────────────────────────┤
│                                 │
│ Choose your subscription plan   │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🆓 Start with Free Trial│     │ ← Trial option (first org)
│ │ 14 days • Full features │     │   OR
│ │ ✓ Unlimited products    │     │ 💎 Premium Subscription
│ │ ✓ 5 team members        │     │   (existing users)
│ │ ✓ Basic analytics       │     │
│ │ ──────────────────────  │     │
│ │ €0.00 for 14 days       │     │
│ │ Then €29/month          │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │     Continue            │     │ ← Primary button
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Step 2: Organization Details (`/organizations/create/details`)
```
┌─────────────────────────────────┐
│ ← Back    Create Organization   │
├─────────────────────────────────┤
│                                 │
│ Organization Details            │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🏢 Organization Name    │     │
│ │ The Golden Hour         │     │
│ ├─────────────────────────┤     │
│ │ 💰 Currency ▼           │     │ ← Dropdown with currencies
│ │ EUR (€)                 │     │
│ └─────────────────────────┘     │
│                                 │
│ Selected Subscription:          │
│ 🆓 Free Trial (14 days)         │ ← Subscription summary
│                                 │
│ ┌─────────────────────────┐     │
│ │   Create Organization   │     │ ← Primary button
│ └─────────────────────────┘     │
│                                 │
│ By creating an organization,    │ ← Terms acceptance
│ you agree to our Terms of       │   (auto-accepted)
│ Service and Privacy Policy.     │
└─────────────────────────────────┘
```

### Components Used
```tsx
// Subscription selection
<SubscriptionSelector />
├── <PlanCard 
│     plan="trial" 
│     selected={true}
│     features={trialFeatures}
│     price="€0.00 for 14 days"
│   />
├── <PlanCard 
│     plan="premium" 
│     selected={false}
│     features={premiumFeatures}
│     price="€49/month"
│   />
└── <Button variant="primary">Continue</Button>

// Organization details
<OrganizationCreationForm />
├── <Input name="name" icon={Building} placeholder="Organization Name" />
├── <Select name="currency" defaultValue="EUR">
│   └── <CurrencyOptions />
├── <Select name="industryType" optional>
│   └── <IndustryOptions />
├── <SubscriptionSummary plan={selectedPlan} />
├── <Button variant="primary">Create Organization</Button>
└── <LegalDisclaimer />
```

## Organization Switching

### Organization Switcher Component
```
Current Organization Header:
┌─────────────────────────────────┐
│ 🍸 The Golden Hour        ▼    │ ← Dropdown trigger
└─────────────────────────────────┘

Expanded Dropdown:
┌─────────────────────────────────┐
│ 🍸 The Golden Hour        ✓    │ ← Current (checked)
│ 🥃 Whiskey & Wine Bar     →    │ ← Switch option
│ ──────────────────────────────  │
│ ➕ Create Organization          │ ← Create new option
└─────────────────────────────────┘
```

### Mobile Organization Switcher (Full Screen)
```
┌─────────────────────────────────┐
│ ← Back    Select Organization   │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🍸 The Golden Hour      │     │ ← Current org (highlighted)
│ │ Owner • 5 members   ✓   │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🥃 Whiskey & Wine Bar   │     │ ← Alternative org
│ │ Manager • 8 members     │     │
│ └─────────────────────────┘     │
│                                 │
│ ──────────────────────────────  │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ➕ Create Organization  │     │ ← Create new option
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Components Used
```tsx
<OrganizationSwitcher />
├── <OrganizationDropdown 
│     currentOrg={currentOrg}
│     organizations={userOrgs}
│     onSwitch={handleSwitch}
│   />
└── <CreateOrganizationOption />

// Mobile version
<OrganizationSwitcherModal />
├── <CurrentOrganizationCard highlighted />
├── <OrganizationList>
│   └── <OrganizationCard onClick={handleSwitch} />
├── <Divider />
└── <CreateOrganizationButton />
```

## Team Management (`/organizations/:id/team`)

### Mobile Team Management Interface
```
┌─────────────────────────────────┐
│ ← Back  The Golden Hour - Team  │ ← Organization name in header
├─────────────────────────────────┤
│                                 │
│ 👥 Team Members (5)       ✉️    │ ← Section header with invite icon
│                                 │
│ ┌─────────────────────────┐     │
│ │ 👤 John Smith (You)     │     │ ← User card (self)
│ │ Owner                   │     │   Role badge
│ │ john@email.com          │     │
│ │ Joined 2 months ago     │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 👤 Sarah Johnson        │     │ ← Team member card
│ │ Manager            ⋮    │     │   Role + menu
│ │ sarah@email.com         │     │
│ │ Joined 1 month ago      │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 👤 Mike Chen            │     │
│ │ Staff              ⋮    │     │
│ │ mike@email.com          │     │
│ │ Joined 2 weeks ago      │     │
│ └─────────────────────────┘     │
│                                 │
│ 📨 Pending Invitations (2)      │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 📧 alice@email.com      │     │ ← Pending invitation
│ │ Invited as Staff        │     │
│ │ Sent 3 days ago    ⋮    │     │ ← Menu (resend, cancel)
│ └─────────────────────────┘     │
│                                 │
│ [Floating Action Button: +]     │ ← Invite new member
└─────────────────────────────────┘
```

### Member Actions Menu
```
Member Menu (Owner/Manager only):
┌─────────────────────────────────┐
│ 📝 Change Role                  │
│ 📧 Resend Invitation            │
│ 🚫 Remove from Organization     │
└─────────────────────────────────┘

Pending Invitation Menu:
┌─────────────────────────────────┐
│ 📧 Resend Invitation            │
│ ❌ Cancel Invitation            │
└─────────────────────────────────┘
```

### Components Used
```tsx
<TeamManagement orgId={orgId} />
├── <TeamMembersList>
│   └── <MemberCard>
│       ├── <UserAvatar name email />
│       ├── <RoleBadge role />
│       ├── <MemberInfo joinDate />
│       └── <MemberActions /> // Owner/Manager only
├── <PendingInvitations>
│   └── <InvitationCard>
│       ├── <InvitationInfo email role sentDate />
│       └── <InvitationActions /> // Resend, Cancel
└── <FloatingActionButton onClick={openInviteModal} />
```

## Invite User Modal

### Mobile Invite Modal
```
┌─────────────────────────────────┐
│ ← Cancel    Invite Team Member  │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────┐     │
│ │ 📧 Email Address        │     │
│ │ user@example.com        │     │
│ ├─────────────────────────┤     │
│ │ 👤 Role ▼               │     │
│ │ Manager                 │     │ ← Role selector dropdown
│ └─────────────────────────┘     │
│                                 │
│ Role Permissions:               │ ← Dynamic permission display
│ ✓ View all inventory            │   based on selected role
│ ✓ Edit products                 │
│ ✓ Adjust stock levels           │
│ ✓ Invite team members           │
│ ✗ Delete organization           │
│                                 │
│ 📝 Personal Message (Optional)  │
│ ┌─────────────────────────┐     │
│ │ Welcome to our team!    │     │ ← Optional message field
│ │ We're excited to have   │     │
│ │ you join us.            │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │      Send Invitation    │     │ ← Primary button
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Role Selection Dropdown
```
┌─────────────────────────────────┐
│  Manager                  ✓   │ ← Selected
│ 👤 Staff                        │
└─────────────────────────────────┘
```

### Components Used
```tsx
<InviteUserModal onClose onInvite>
├── <Input name="email" type="email" icon={Mail} />
├── <RoleSelector 
│     value={selectedRole}
│     onChange={setSelectedRole}
│     options={['manager', 'staff']} // Only manager and staff roles available
│   />
├── <PermissionDisplay role={selectedRole} />
├── <Textarea 
│     name="message" 
│     placeholder="Personal message (optional)"
│     maxLength={500}
│   />
└── <Button variant="primary">Send Invitation</Button>
```

## Organization Settings (`/organizations/:id/settings`)

### Mobile Organization Settings
```
┌─────────────────────────────────┐
│ ← Back    Organization Settings │
├─────────────────────────────────┤
│                                 │
│ 🏢 Organization Details         │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Name                    │     │
│ │ The Golden Hour         │     │
│ ├─────────────────────────┤     │
│ │ Currency                │     │
│ │ EUR (€)                 │     │
│ ├─────────────────────────┤     │
│ │ Industry Type           │     │
│ │ Cocktail Bar            │     │
│ └─────────────────────────┘     │
│                                 │
│ 💳 Subscription                 │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🆓 Free Trial           │     │
│ │ 8 days remaining        │     │
│ │ ──────────────────────  │     │
│ │ [Upgrade to Premium]    │     │ ← CTA button
│ └─────────────────────────┘     │
│                                 │
│ ⚙️ Organization Settings        │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Default Par Level   5   │     │ ← Setting items
│ ├─────────────────────────┤     │
│ │ Low Stock Threshold 20% │     │
│ ├─────────────────────────┤     │
│ │ Notifications      On   │     │
│ └─────────────────────────┘     │
│                                 │
│ ⚠️ Danger Zone                  │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Delete Organization     │     │ ← Destructive action (Owner only)
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Components Used
```tsx
<OrganizationSettings orgId={orgId} />
├── <OrganizationDetailsForm>
│   ├── <Input name="name" />
│   ├── <Select name="currency" />
│   └── <Select name="industryType" />
├── <SubscriptionCard>
│   ├── <SubscriptionStatus />
│   └── <UpgradeButton /> // If on trial/lower tier
├── <OrganizationPreferences>
│   ├── <NumberInput name="defaultParLevel" />
│   ├── <PercentageInput name="lowStockThreshold" />
│   └── <ToggleSwitch name="notifications" />
└── <DangerZone> // Owner only
    └── <DeleteOrganizationButton />
```

## Mobile-Specific Interactions

### Touch Patterns
- **Tap**: Select organization, open details
- **Long Press**: Quick action menu (edit, delete)
- **Swipe Right**: Accept invitation
- **Swipe Left**: Decline invitation or remove member
- **Pull to Refresh**: Update organization list

### Navigation Flow
```
Organizations Dashboard
├── Create Organization
│   ├── Subscription Selection
│   └── Organization Details
├── Organization Details
│   ├── Team Management
│   │   └── Invite User Modal
│   └── Organization Settings
└── Switch Organization
```

### Accessibility Considerations
- **Role indicators**: Clear visual and text indication of user roles
- **Permission descriptions**: Clear explanation of what each role can do
- **Confirmation dialogs**: For destructive actions (delete, remove member)
- **Loading states**: For organization creation and invitation sending

This organization management system provides comprehensive control over business entities while maintaining the mobile-first, elegant user experience consistent with the Barback design system.
