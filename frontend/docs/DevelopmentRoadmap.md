# Barback Frontend - Development Roadmap

Phased development roadmap following SPA → PWA progression. See `TechStackGuide.md` for technical details and `TestingGuide.md` for testing strategy.

## Overview

**Strategy**: Progressive enhancement from SPA to PWA

## Phase 1: SPA Foundation - MVP

### **Sprint 1-2: Project Setup, Design System & Authentication**

#### **Sprint Goals**
- [X] Initialize Vite + React + TypeScript project
- [X] Define design system (colors, typography, spacing)
- [X] Set up localization (i18n) with English and Italian
- [X] Implement light/dark mode theme
- [X] Add core shadcn/ui components
- [X] Implement authentication system
- [X] Create basic routing structure
- [X] Implement password reset functionality

### **Sprint 3-4: Organization & User Management**

#### **Sprint Goals**
- [X] Implement organization creation
  - [X] organization creation page
    - [X] first draft
    - [X] creation wizard with different steps:
      - [X] step 1: organization name
        - [X] frontend should validate org name is valid with api from backend
      - [X] step 2: plan selection
      - [X] step 3: payment
  - [X] integrate with stripe
    - **stripe docs**
      - subscription
        - https://docs.stripe.com/payments/advanced/build-subscriptions?platform=web&ui=elements&lang=node
      - payment element
        - https://docs.stripe.com/payments/payment-element
        - https://docs.stripe.com/payments/payment-element/best-practices
      - express checkout element
        - https://docs.stripe.com/elements/express-checkout-element
        - https://docs.stripe.com/elements/express-checkout-element/migration
      - appearance
        - https://docs.stripe.com/elements/appearance-api
    - [X] working draft integration with stripe payment elements
    - [X] migrate to express checkout element
      - [X] test over https (using ngrok)
    - [X] consolidate payment methods
      - [X] card payments
        - [ ] remove link payment method?
      - [X] google pay
      - [X] apple pay
    - [X] consolidate stripe elements appearance
      - [X] color vars don't seem to work properly. `[Stripe.js] elements-inner-loader-ui.html: invalid variable value "var(--color-primary)" provided to "colorPrimary"; "colorPrimary" accepts a valid HEX, rgb(), or hsl() CSS color.`
    - [X] improve organization creation flow after payment
      - [X] local subscription created by webhook with initial INCOMPLETE status
      - [X] organization created immediately after payment confirmation
      - [X] redirect to organization page showing subscription status
      - [ ] on failure state, surface actions on organization page to retry/change payment method or cancel organization
    - [X] consolidate plans/pricing
- [ ] Implement Organizations Hub Page (`/orgs`)
  - [ ] Refactor `OrganizationsPage` with sections layout
    - [ ] **Pending Invitations Section** (top, requires attention)
      - [ ] Horizontal scrollable row of compact invitation cards
      - [ ] Card shows: org name, owner, user's future role
      - [ ] Card actions: Accept / Decline buttons
      - [ ] "Show all (N)" button → expands to multiple rows (not horizontally scrollable)
      - [ ] "Show less" button → collapses back to horizontal row
      - [ ] Section hidden when no pending invitations
    - [ ] **My Venues Section**
      - [ ] Keep existing filters (search, role toggle)
      - [ ] Organization cards grid with selection
      - [ ] "Create Venue" button
  - [ ] Add invitations badge count to UserMenu
  - [ ] Empty states for both sections
- [ ] Implement Organization Detail Page (`/orgs/:orgId`) - Role-Aware
  - [ ] **All members can view:**
    - [ ] Organization name
    - [ ] Owner info
    - [ ] Members list with roles
    - [ ] Subscription status (only if not active/trialing)
  - [ ] **Owner/Manager can:**
    - [ ] View pending invitations sent by org
    - [ ] Send new invitations (existing `SendInvitationDialog`)
    - [ ] Revoke pending invitations (with confirmation)
    - [ ] Edit member roles (inline dropdown)
    - [ ] Remove members (× icon with confirmation dialog)
  - [ ] **Owner only can:**
    - [ ] Edit organization name (inline edit with validation)
      - [ ] **Backend needed**: Add PUT endpoint for org name update
    - [ ] Edit currency (inline dropdown)
    - [ ] View full subscription details
      - [ ] Status badge
      - [ ] Renewal text: "Subscription will renew/end on [date]"
      - [ ] Next billing date
      - [ ] Current period start
      - [ ] Creation date
    - [ ] Manage payment method (Sheet/Dialog with Stripe)
    - [ ] Cancel subscription (confirmation dialog)
- [ ] Implement Navigation & Quick Switch
  - [ ] Refactor `UserMenu` dropdown
    - [ ] Add "My Venues" item → links to `/orgs`
    - [ ] Add invitations badge to "My Venues" item when pending
    - [ ] Refactor "Current Venue" item for quick switch
  - [ ] Implement Quick Org Switch
    - [ ] Desktop: dropdown extension/popover from "Current Venue"
      - [ ] Show current org highlighted
      - [ ] List other orgs (max 5)
      - [ ] "View all" link to `/orgs`
    - [ ] Mobile: Bottom Sheet component
      - [ ] `OrganizationSwitcherSheet` component
      - [ ] Triggered from UserMenu "Current Venue" item
      - [ ] Same content as desktop popover
      - [ ] Swipe down to dismiss
- [ ] Implement Invitation Management
  - [ ] Create `useInvitations` hook
    - [ ] Query for pending invitations (`GET /api/invites`)
    - [ ] Accept mutation (`POST /api/invites/:id/accept`)
    - [ ] Decline mutation (`POST /api/invites/:id/decline`)
    - [ ] Sync with `organizationStore.pendingInvitations`
  - [ ] Refactor `InvitationCard` for received invitations
    - [ ] Org name, role badge, inviter info
    - [ ] Sent date, expiry date/countdown
    - [ ] Accept/Decline buttons
    - [ ] Expired state styling
  - [ ] Create `InvitationList` component with empty state
- [ ] Create Skeleton Components
  - [ ] `MemberCardSkeleton`
  - [ ] `InvitationCardSkeleton`
  - [ ] `PendingInvitationCardSkeleton`
  - [ ] `SubscriptionCardSkeleton`
- [ ] Create/Refactor Organization Components
  - [ ] `MemberCard` - refactor with inline role dropdown
  - [ ] `MemberList` - new, with owner/manager actions
  - [ ] `PendingInvitationList` - new, org's outgoing invitations
  - [ ] `SubscriptionCard` - new, detailed subscription info
  - [ ] `InlineEditField` - reusable inline edit component
  - [ ] `ConfirmationDialog` - reusable confirmation dialog
  - [ ] `OrganizationSwitcherSheet` - mobile bottom sheet
  - [ ] `OrganizationSwitcherPopover` - desktop popover
  - [ ] `InvitationsBadge` - notification badge component
- [X] Create organization switching functionality (basic)
- [ ] User Settings & Profile Management:
  - [ ] Build user profile page
  - [ ] Implement profile editing (name, phone, profile picture)
  - [ ] Add password change functionality
  - [ ] Create account deletion flow
  - [X] Move theme toggle and language selector to settings page (from navigation)
- **fixes needed**
  - [ ] Date formatting doesn't respect user's locale from i18n
  - [ ] refresh token service restarts every page load
- **good to have**
  - [ ] routes consolidation
  - [ ] update toasters style and position
  - [ ] consolidate type names for requests/responses to/from backend
  - [ ] autofocus first input on modals and forms
  - [ ] `enter` key goes to next input or submits form
  - [ ] consolidate loading states (skeletons, spinners)

### **Sprint 5-6: Core Inventory Management**

#### **Sprint Goals**
- [ ] Build product management (CRUD operations)
- [ ] Implement stock adjustment system
- [ ] Create inventory dashboard
- [ ] Add low stock alerts

---

## Phase 2: PWA Enhancement

### **Sprint 7: Service Worker Implementation**

#### **Sprint Goals**
- [ ] Set up service worker infrastructure
- [ ] Implement basic caching strategies
- [ ] Add offline inventory viewing

#### **Files Created**
- `public/sw.js` - Service worker implementation
- `src/lib/sw-registration.ts` - SW registration logic
- `src/components/OfflineBanner.tsx` - Offline status indicator

#### **Caching Strategies**
- Static assets (JS, CSS): Cache First
- API data (products): Network First with cache fallback
- Images: Stale While Revalidate

### **Sprint 8: Web App Manifest & Installation**

#### **Sprint Goals**
- [ ] Create web app manifest
- [ ] Implement install prompt
- [ ] Add app icons and splash screens

#### **PWA Features**
- App name, description, and branding
- App icons (192px, 512px, maskable)
- Standalone display mode
- Custom install prompt

### **Sprint 9: Push Notifications**

#### **Sprint Goals**
- [ ] Implement web push notifications
- [ ] Create notification permission handling
- [ ] Build low stock alert notifications

#### **Notification Types**
- Low stock alerts (when quantity < par level)
- Stock adjustment confirmations
- User invitation notifications

### **Sprint 10: Background Sync & Advanced PWA Features**

#### **Sprint Goals**
- [ ] Implement background sync for offline actions
- [ ] Add IndexedDB for complex offline storage
- [ ] Create conflict resolution for offline edits

#### **Background Sync Features**
- Offline stock adjustments queued for sync
- Automatic sync when connection restored
- Sync status indicators in UI

### **Phase 2 Success Criteria**
- [ ] App works completely offline for viewing inventory
- [ ] Offline stock adjustments sync when connection restored
- [ ] Push notifications work for low stock alerts
- [ ] App can be installed on home screen/desktop

---

## Phase 3: Advanced Features

### **Sprint 11-12: Mobile UX & Analytics**

#### **Sprint Goals**
- [ ] Optimize touch interactions for mobile
- [ ] Build analytics dashboard
- [ ] Implement consumption tracking

#### **Analytics Features**
- Consumption by time period, category, product
- Stock level trends
- Low stock frequency analysis
- Exportable reports (PDF, CSV)

### **Sprint 13-14: Enhanced Notifications & Alerts**

#### **Sprint Goals**
- [ ] Advanced notification system
- [ ] Scheduled notifications
- [ ] Email notification integration

#### **Enhanced Notifications**
- Time-based inventory reminders
- Customizable alert thresholds per product
- Notification history and management

### **Sprint 15-16: Performance & Polish**

#### **Sprint Goals**
- [ ] Performance optimization
- [ ] Error monitoring and logging
- [ ] Accessibility improvements

#### **Quality Targets**
- Lighthouse PWA score > 90
- WCAG 2.1 AA accessibility compliance
- Comprehensive error logging

---

## Success Metrics

### **Phase 1 (SPA)**
- [ ] Core functionality complete and tested
- [ ] Mobile-responsive design
- [ ] User acceptance testing passed

### **Phase 2 (PWA)**
- [ ] Lighthouse PWA score > 80
- [ ] Offline functionality working
- [ ] Install rate > 20% for engaged users

### **Phase 3 (Advanced)**
- [ ] Performance optimized (Lighthouse > 90)
- [ ] Analytics providing valuable insights
- [ ] User satisfaction > 4.5/5

## Dependencies & Prerequisites

### **External Services**
- Firebase Cloud Messaging (push notifications)
- Google OAuth (authentication)
- Backend API (inventory data)
