# User Experience Reference - MVP

## Overview

Essential UX flows and patterns for Barback inventory management app MVP. Mobile-first design for bar environments with role-based access (Owner, Manager, Staff).

## App Architecture

```
Barback MVP Structure
├── 🔐 Authentication
│   ├── Register/Login (Email + Google)
│   ├── Email Verification (Required)
│   └── Password Reset
├── 💳 Subscription Management
│   ├── Plan Selection (Free Trial/Paid)
│   └── Payment Processing
├── 🏢 Organization Setup
│   ├── Organization Creation (Owner only)
│   ├── Team Invitations (Owner/Manager)
│   └── Role Management
└── 📱 Core App
    ├── 🏠 Dashboard (Alerts, Quick Actions)
    ├── 📦 Inventory (Products, Stock Adjustments)
    ├── 📊 Reports & Analytics
    └── ⚙️ Settings
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
Dashboard Review → Address Alerts → Stock Adjustments → 
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
1. **Product Creation**: Name, category, unit, par level, quantity
2. **Stock Adjustments**: +/- buttons with reason codes
3. **Product Search**: Quick find with category filters
4. **Bulk Operations**: Multi-select for efficiency

### Alert System Flow
1. **Threshold Setting**: Custom low-stock alerts per product
2. **Alert Generation**: Automatic when stock drops below threshold
3. **Alert Response**: Direct link to product for quick action
4. **Alert Resolution**: Auto-clear when stock restored

### Reports & Analytics Flow
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
- **Bottom Tabs**: Primary navigation (Dashboard, Inventory, Settings)
- **Header Search**: Global product search
- **Floating Action Button**: Add new product (Inventory screen)
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
- **Owner**: Analytics focus, team management, strategic view
- **Manager**: Operational focus, alerts priority, team coordination
- **Staff**: Task focus, minimal interface, quick updates

### Error Prevention
- **Confirmation Dialogs**: For destructive actions (delete product)
- **Auto-save**: Draft changes during connectivity issues
- **Input Validation**: Real-time feedback on forms
- **Undo Actions**: Recent stock adjustments
