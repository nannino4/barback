# User Experience Reference - MVP

## Overview

Essential UX flows and patterns for Barback inventory management MVP. Mobile-first design for bar environments with role-based access (Owner, Manager, Staff). Inventory is the primary workspace; minimize navigation and keep high-frequency actions within 1–2 taps.

## App Architecture

```
Barback MVP Structure
├── 🔐 Authentication
│   ├── Register/Login (Email + Google)
│   ├── Email Verification (Required)
│   └── Password Reset
├── 🏢 Organization Setup
│   ├── Organization Creation (Owner only)
│   ├── Plan Selection (Free Trial/Paid)
│   ├── Payment Processing
│   ├── Team Invitations (Owner/Manager)
│   └── Role Management
└── 📱 Core App
    ├── 📦 Inventory (Overview, Products, Categories)
    ├── 🚨 Alerts (Low stock, critical items)
    └── ⚙️ Organization Settings (Members, Categories, Products)
```

## User Roles & Key Behaviors

### Owner (Organization Owner)
- **Goals**: Cost control, waste reduction, operational oversight
- **Key Actions**: Setup organization, invite team, review analytics
- **Usage**: Daily check-ins (5-10 min), weekly reviews (30-45 min)

### Manager (Organization Manager)  
- **Goals**: Stock visibility, team coordination, efficient operations
- **Key Actions**: Stock adjustments, team management, alert responses
- **Usage**: Multiple daily sessions, real-time updates

### Staff (Organization Staff)
- **Goals**: Quick stock updates, minimal workflow disruption
- **Key Actions**: Stock counts, basic adjustments
- **Usage**: Quick interactions during shifts (1-3 min)

## Critical User Flows

### 1. New Owner Onboarding
```
Registration → Email Verification → Subscription Selection → 
Organization Setup → First Product Addition → Team Invitation
Total: 15-20 minutes to working system
```

### 2. Invited User Journey
```
Email Invitation → Registration → Email Verification → 
Organization Access → Role Assignment → First Action
Total: 5-10 minutes to productivity
```

### 3. Daily Inventory Management
```
Inventory Overview → Address Alerts → Stock Adjustments → 
Product Updates → Team Coordination
Total: 5-15 minutes per session
```

## Core Feature Flows

### Authentication Flow
1. **Registration**: Email/Google options
2. **Email Verification**: Required before access
3. **Login**: Persistent sessions with role-based routing
4. **Password Reset**: Email-based recovery

### Subscription Management Flow
1. **Plan Selection**: Free trial vs paid options
2. **Payment Processing**: Secure checkout
3. **Subscription Activation**: Enables organization creation
4. **Plan Management**: cancel options

### Organization Setup Flow
1. **Organization Creation**: Name, settings (Owner only)
2. **Team Invitations**: Email invites with role selection
3. **Invitation Management**: Accept/decline, revoke options
4. **Role Assignment**: Owner, Manager, Staff permissions

### Inventory Management Flow
1. **Inventory Overview**: Low-stock summary, quick actions
2. **Products**: Create/edit products (name, category, unit, par level, quantity)
3. **Stock Adjustments**: +/- buttons with reason codes
4. **Product Search**: Quick find with category filters
5. **Categories**: Create/edit categories, view product counts
6. **Bulk Operations**: Multi-select for efficiency

### Alert System Flow
1. **Threshold Setting**: Custom low-stock alerts per product
2. **Alert Generation**: Automatic when stock drops below threshold
3. **Alert Response**: Direct link to product for quick action
4. **Alert Resolution**: Auto-clear when stock restored

### Reports & Analytics Flow (Deferred)
1. **Report Generation**: Date range selection
2. **Consumption Analysis**: By time period, category, product
3. **Export Options**: PDF, CSV formats
4. **Historical Data**: Trend analysis and insights

## Mobile-First Interaction Patterns

### Touch Patterns
- **Single Tap**: Navigate, select, confirm
- **Long Press**: Context menus, bulk selection
- **Swipe Right**: Quick positive actions (adjust stock up)
- **Swipe Left**: Secondary actions (edit, delete)
- **Pull to Refresh**: Sync latest data

### Navigation
- **Bottom Tabs**: Primary navigation (Inventory, Alerts, More)
- **Top Bar**: Organization switcher visible at all times
- **Header Search**: Product search inside Inventory
- **Floating Action Button**: Add product (Inventory screen)
- **Back Button**: Consistent navigation hierarchy

### Feedback
- **Haptic**: Success (light), error (heavy), selection (medium)
- **Visual**: Loading states, success animations, error highlights
- **Notifications**: Toast for confirmations, alerts for critical actions

## Key UX Principles

### Mobile-First Bar Environment
- **Large Touch Targets**: 44px minimum for gloved hands
- **High Contrast**: Readable in dim bar lighting
- **Quick Actions**: Minimize steps for common tasks
- **Offline Capability**: Basic functionality when connectivity poor

### Role-Based Experience
- **Owner**: Inventory oversight, member management, strategic view
- **Manager**: Operational focus, alerts priority, team coordination
- **Staff**: Task focus, minimal interface, quick updates

### Error Prevention
- **Confirmation Dialogs**: For destructive actions (delete product)
- **Auto-save**: Draft changes during connectivity issues
- **Input Validation**: Real-time feedback on forms
- **Undo Actions**: Recent stock adjustments

## Updated MVP UX Decisions

### Navigation & IA
- **Inventory is the default home** for all roles (no standalone dashboard).
- **Bottom navigation** (mobile): Inventory, Alerts, More.
- **Top bar organization switcher** is always visible to keep context explicit.
- **User menu** is for account + preferences only.

### Inventory Hub (Primary Workspace)
- **Top section: Inventory Overview**
    - Low-stock summary, critical items, quick actions.
- **Tabs/Segments** within Inventory:
    - **Products** (default)
    - **Categories**
- **Products view**
    - Search, category filter, low-stock filter.
    - Inline quick adjust (+/-) and row actions (edit/archive).
    - Primary action: Add product (FAB on mobile).
- **Categories view**
    - Simple list with product counts.
    - Add/edit category inline or modal.
    - Category detail shows products in that category.

### Organization Settings
- Single settings area for org-level tasks, role-gated:
    - **Overview** (name, timezone)
    - **Members**
    - **Categories**
    - **Products**
- Rationale: org admin tasks are not personal account actions and should not live in the user menu.

### Alerts
- Separate view for low-stock items and critical alerts.
- Quick actions: adjust stock, mark resolved.

## Role-Based Defaults

- **Owner**: Inventory Overview + Alerts summary + Member tools.
- **Manager**: Inventory Overview + Alerts + quick adjustments.
- **Staff**: Inventory + quick adjustments, minimal admin actions.
