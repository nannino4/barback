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
      - [X] google pay
      - [X] apple pay
    - [X] consolidate stripe elements appearance
      - [X] color vars don't seem to work properly. `[Stripe.js] elements-inner-loader-ui.html: invalid variable value "var(--color-primary)" provided to "colorPrimary"; "colorPrimary" accepts a valid HEX, rgb(), or hsl() CSS color.`
    - [X] improve organization creation flow after payment
      - [X] local subscription created by webhook with initial INCOMPLETE status
      - [X] organization created immediately after payment confirmation
      - [X] redirect to organization page showing subscription status
    - [X] consolidate plans/pricing
- [X] Implement Organizations Hub Page (`/orgs`)
  - [X] Refactor `OrganizationsPage` with sections layout
    - [X] **Pending Invitations Section** (top, requires attention)
      - [X] Grid of invitation cards
      - [X] Card shows: org name, owner, user's future role, inviter info
      - [X] Card actions: Accept / Decline buttons
      - [X] Section hidden when no pending invitations
    - [X] **My Venues Section**
      - [X] Keep existing filters (search, role toggle)
      - [X] Organization cards grid with selection
      - [X] "Create Venue" button
  - [X] Add invitations badge count to UserMenu
  - [X] Empty states for both sections
- [X] Implement Organization Detail Page (`/orgs/:orgId`) - Role-Aware
  - [X] **All members can view:**
    - [X] Organization name
    - [X] Owner info
    - [X] Members list with roles
    - [X] Subscription status (only if not active/trialing)
  - [X] **Owner/Manager can:**
    - [X] View pending invitations sent by org
    - [X] Send new invitations (existing `SendInvitationDialog`)
    - [X] Revoke pending invitations (with confirmation)
    - [X] Edit member roles (inline dropdown)
    - [X] Remove members (× icon with confirmation dialog)
  - [X] **Owner only can:**
    - [X] Edit organization name (inline edit with validation)
    - [X] Edit currency (inline dropdown)
    - [X] View full subscription details
      - [X] Status badge
      - [X] Renewal text: "Subscription will renew/end on [date]"
      - [X] Next billing date
      - [X] Creation date
    - [ ] Manage payment method (Sheet/Dialog with Stripe)
    - [ ] Cancel subscription (confirmation dialog)
  - [X] **Non-owner members can:**
    - [X] Leave organization (with confirmation dialog)
- [X] Implement Navigation & Quick Switch
  - [X] Refactor `UserMenu` dropdown
    - [X] Add "My Venues" item → links to `/orgs`
    - [X] Add invitations badge to "My Venues" item when pending
      - [X] Add clue also when menu is closed (red dot)
    - [X] Refactor "Current Venue" item for quick switch
  - [X] Implement Quick Org Switch
    - [X] Desktop: `OrganizationSwitcherPopover` from "Current Venue"
      - [X] Show current org highlighted
      - [X] List other orgs (max 5)
      - [X] "View all" link to `/orgs`
    - [X] Mobile: `OrganizationSwitcherSheet` component
      - [X] Triggered from UserMenu "Current Venue" item
      - [X] Same content as desktop popover
      - [X] Swipe down or tap outside to dismiss
      - [X] Selecting an org switches immediately and dismisses
- [X] Implement Invitation Management
  - [X] Create `useInvitations` hook
    - [X] Query for pending invitations (`GET /api/invitations`)
    - [X] Accept mutation (`POST /api/invitations/accept/:token`)
    - [X] Decline mutation (`POST /api/invitations/decline/:token`)
  - [X] Refactor `InvitationCard` for received invitations
    - [X] Org name, role badge, inviter info
    - [X] Accept/Decline buttons
    - [X] Expired state styling
  - [X] Create `InvitationList` component with empty state
- [X] Create Skeleton Components
  - [X] `MemberCardSkeleton`
  - [X] `InvitationCardSkeleton`
  - [X] `SubscriptionCardSkeleton`
- [X] Create/Refactor Organization Components
  - [X] `MemberCard` - refactor with inline role dropdown
  - [X] `MemberList` - with owner/manager actions
  - [X] `PendingInvitationCard` - org's outgoing invitations with revoke
  - [X] `SubscriptionCard` - detailed subscription info
  - [X] `InlineEditField` - reusable inline edit component
  - [X] `InlineEditSelect` - reusable inline select component
  - [X] `ConfirmationDialog` - reusable confirmation dialog
  - [X] `OrganizationSwitcherSheet` - mobile bottom sheet
  - [X] `OrganizationSwitcherPopover` - desktop popover
  - [X] `InvitationsBadge` - notification badge component
- [X] Create organization switching functionality (basic)
- [X] User Profile Management
  - user personal info card
    - user profile picture (editable)
    - user full name (editable)
    - user email (not editable)
    - reset password button
- **fixes needed**
  - [X] Date formatting doesn't respect user's locale from i18n
  - [X] Timezone management foundation
    - [X] Add timezone preference setting (auto + IANA list)
    - [X] Use `Intl.DateTimeFormat().resolvedOptions().timeZone` for auto detection
    - [X] Persist timezone preference in user profile
    - [X] Ensure all date formatting uses timezone-aware helpers
  - [X] refresh token service restarts every page load
- **good to have**
  - [X] routes consolidation
  - [X] update toasters style and position
  - [ ] consolidate type names for requests/responses schemas to/from backend
  - [X] autofocus first input on modals and forms
  - [X] `enter` key goes to next input or submits form
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
