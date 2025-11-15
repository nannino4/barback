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
      - [ ] fix ui issues
        - [ ] wizard (steps indicator, spacing). could we use shadcn/ui steps component?
        - [ ] plan selection
          - [ ] plan cards don't have spacing in mobile view
          - [ ] some label keys missing
          - [ ] better show savings percent dynamically instead of hardcoding it in translation files. also show original price crossed out
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
    - [ ] consolidate payment methods
      - [ ] card payments
      - [ ] google pay
      - [ ] apple pay
    - [ ] consolidate stripe elements appearance
      - [ ] color vars don't seem to work properly. `[Stripe.js] elements-inner-loader-ui.html: invalid variable value "var(--color-primary)" provided to "colorPrimary"; "colorPrimary" accepts a valid HEX, rgb(), or hsl() CSS color.`
    - [ ] improve organization creation flow after payment
      - [X] consider polling for subscription status instead of waiting fixed time
        - [ ] check subscription status by sending stripeSubscriptionId. implement backend endpoints as needed
        - [ ] define max time to wait before showing error. handle case on backend where subscription is not active after max time. maybe cancel subscription automatically?
      - [ ] handle payment failures
    - [X] consolidate plans/pricing
- [ ] Implement organization management
  - [ ] members
    - [ ] design member card component
    - [ ] view current members
    - [ ] invite members via email
    - [ ] role management (manager, staff)
  - [ ] settings (name, currency)
  - [ ] subscription management with billing info
- [ ] Implement invitation management
  - [ ] design ui/ux for button to invitation page
  - [ ] implement invitation page
    - [ ] design invitation card component
    - [ ] view pending and expired/revoked invitations
    - [ ] accept/decline invitations
- [X] Create organization switching functionality
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
  - [ ] update toasters color and position
  - [ ] consolidate type names for requests/responses to/from backend

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
