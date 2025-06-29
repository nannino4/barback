# Home (Dashboard) UI Specifications

## Overview

The Home page serves as the central dashboard for Barback, providing users with an at-a-glance view of their inventory status, alerts, recent activity, and quick access to common actions.

## Mobile Dashboard Layout

### Primary Dashboard View
```
┌─────────────────────────────────┐
│ The Golden Hour                 │ ← Organization name
├─────────────────────────────────┤
│                                 │
│ 📊 Quick Stats                  │ ← Stats section header
│ ┌────────┬────────┬────────┐   │
│ │   42   │   7    │ €2,340 │   │ ← Metric cards
│ │Products│ Low    │ Total  │   │   
│ │        │ Stock  │ Value  │   │   
│ └────────┴────────┴────────┘   │
│                                 │
│ 🚨 Alerts (7)              📋  │ ← User-defined alert thresholds
│ ┌─────────────────────────┐     │
│ │ ⚠️  Grey Goose Vodka    │ ← Alert based on user thresholds
│ │     2/12 bottles        │   
│ │     Below threshold     │     
│ └─────────────────────────┘     │
│ ┌─────────────────────────┐     │
│ │ ⚠️  Aperol             │     
│ │     1/8 bottles         │     
│ │     Below threshold     │     
│ └─────────────────────────┘     │
│                                 │
│ 📝 Inventory Activity      🔄  │ ← Inventory logs only
│ ┌─────────────────────────┐     │
│ │ • Mike +6 Prosecco      │ ← Inventory adjustments only
│ │   2 hours ago           │     
│ │ • Sarah -2 Gin          │     
│ │   4 hours ago           │     
│ │ • Stock take: Rum       │     
│ │   6 hours ago           │     
│ └─────────────────────────┘     │
│ ┌──────────┬──────────────┐     │
│ │   ➕     │      👥      │     │
│ │ New      │   Team       │     │
│ │ Product  │   Members    │     │
│ └──────────┴──────────────┘     │
└─────────────────────────────────┘
```

## Dashboard Components

### Greeting Header
```tsx
<DashboardGreeting>
├── <TimeBasedGreeting> // "Good morning/afternoon/evening"
├── <UserName>{currentUser.firstName}</UserName>
└── <OrganizationName>{currentOrg.name}</OrganizationName>
```

### Quick Stats Cards
```tsx
<QuickStatsGrid>
├── <StatCard>
│   ├── <StatValue>42</StatValue>
│   ├── <StatLabel>Products</StatLabel>
│   └── <StatTrend>+3 this week</StatTrend>
├── <StatCard variant="warning">
│   ├── <StatValue>7</StatValue>
│   ├── <StatLabel>Low Stock</StatLabel>
│   └── <StatIcon><AlertTriangle /></StatIcon>
└── <StatCard>
    ├── <StatValue>€2,340</StatValue>
    ├── <StatLabel>Total Value</StatLabel>
    └── <StatTrend>+€120 this week</StatTrend>
```

### Stats Calculation Logic
- **Products**: Total active products in inventory
- **Low Stock**: Products below par level threshold
- **Total Value**: Sum of (quantity × unit cost) for all products
- **Trends**: Week-over-week comparison with visual indicators

## Alert System

### Low Stock Alerts
```
Alert Card States:
┌─────────────────────────────────┐
│ 🔴 Grey Goose Vodka         ⋮  │ ← Critical (0-20% of par)
│    2/12 bottles • 17%          │   Red indicator
│    Order immediately           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🟡 Aperol                   ⋮  │ ← Warning (21-40% of par)
│    3/8 bottles • 38%           │   Yellow indicator
│    Order soon                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🟠 Prosecco                 ⋮  │ ← Low (41-60% of par)
│    5/10 bottles • 50%          │   Orange indicator
│    Monitor closely             │
└─────────────────────────────────┘
```

### Alert Swipe Actions
- **Swipe Right**: Mark as acknowledged
- **Swipe Left**: Quick stock adjustment
- **Tap**: View product details
- **Long Press**: Bulk select mode

### Alert Components
```tsx
<AlertsList>
├── <AlertCard 
│     product={product}
│     severity="critical" // critical, warning, low
│     currentStock={2}
│     parLevel={12}
│     onAcknowledge={handleAcknowledge}
│     onQuickAdjust={handleQuickAdjust}
│   />
└── <ViewAllAlertsButton to="/alerts" />
```

## Activity Timeline

### Recent Activity Display
```
Activity Item Types:
┌─────────────────────────────────┐
│ • 📦 Mike added 6x Prosecco     │ ← Stock addition
│   2 hours ago                   │
├─────────────────────────────────┤
│ • 📉 Sarah adjusted Gin -2      │ ← Stock adjustment
│   4 hours ago                   │
├─────────────────────────────────┤
│ • ⚠️ Low stock alert: Dark Rum  │ ← System alert
│   6 hours ago                   │
├─────────────────────────────────┤
│ • 👤 Alex joined the team       │ ← Team activity
│   1 day ago                     │
├─────────────────────────────────┤
│ • ➕ New product: Mezcal        │ ← Product creation
│   2 days ago                    │
└─────────────────────────────────┘
```

### Activity Components
```tsx
<ActivityTimeline>
├── <ActivityItem 
│     type="stock_adjustment"
│     user={user}
│     product={product}
│     quantity={quantity}
│     timestamp={timestamp}
│     icon={<Package />}
│   />
├── <ActivityItem 
│     type="alert"
│     product={product}
│     alertType="low_stock"
│     timestamp={timestamp}
│     icon={<AlertTriangle />}
│   />
└── <ViewAllActivityButton to="/activity" />
```

### Activity Types
- **Stock Adjustments**: Additions, removals, corrections
- **Product Management**: Created, updated, deleted
- **Team Activity**: Invitations, role changes, joins
- **System Alerts**: Low stock, sync issues, etc.
- **Reports**: Generated, exported, shared

## Quick Actions Grid

### Mobile Quick Actions
```
┌─────────────────────────────────┐
│ ⚡ Quick Actions               │
│                                 │
│ ┌──────────┬──────────────┐     │
│ │   📝     │      📊      │     │ ← Primary actions
│ │ Add      │   View       │     │   (most used)
│ │ Stock    │   Reports    │     │
│ └──────────┴──────────────┘     │
│ ┌──────────┬──────────────┐     │
│ │   ➕     │      👥      │     │ ← Secondary actions
│ │ New      │   Team       │     │
│ │ Product  │   Members    │     │
│ └──────────┴──────────────┘     │
│ ┌──────────┬──────────────┐     │
│ │   📋     │      ⚙️      │     │ ← Tertiary actions
│ │ All      │   Settings   │     │
│ │ Products │              │     │
│ └──────────┴──────────────┘     │
└─────────────────────────────────┘
```

### Quick Action Components
```tsx
<QuickActionsGrid>
├── <QuickActionCard 
│     to="/inventory/adjust"
│     icon={<Edit3 />}
│     title="Add Stock"
│     subtitle="Record delivery"
│     variant="primary"
│   />
├── <QuickActionCard 
│     to="/analytics"
│     icon={<BarChart3 />}
│     title="View Reports"
│     subtitle="Analytics"
│     variant="primary"
│   />
├── <QuickActionCard 
│     to="/inventory/products/new"
│     icon={<Plus />}
│     title="New Product"
│     subtitle="Add to inventory"
│     variant="secondary"
│   />
└── <QuickActionCard 
    to="/team"
    icon={<Users />}
    title="Team Members"
    subtitle="Manage team"
    variant="secondary"
  />
```

## Tablet/Desktop Dashboard Layout

### Two-Column Desktop Layout
```
┌───────────────────────────────────────────────┐
│ 🌅 Good morning, John • The Golden Hour       │
├───────────────────────────────────────────────┤
│                                               │
│ 📊 Quick Stats                                │
│ ┌──────┬──────┬──────┬──────┬──────────┐     │
│ │  42  │  7   │€2,340│ 89%  │ €456/wk  │     │ ← Expanded stats
│ │Prods │ Low  │Value │ Fill │ Avg Spend│     │
│ └──────┴──────┴──────┴──────┴──────────┘     │
│                                               │
│ ┌─────────────────────┬─────────────────────┐ │
│ │ 🚨 Alerts (7)       │ 📝 Quick Actions    │ │ ← Side by side
│ │                     │                     │ │
│ │ ⚠️ Grey Goose       │ ┌─────────┬─────────┐│ │
│ │    2/12 bottles     │ │   📝    │   📊   ││ │
│ │                     │ │ Stock   │Reports ││ │
│ │ ⚠️ Aperol          │ └─────────┴─────────┘│ │
│ │    3/8 bottles      │ ┌─────────┬─────────┐│ │
│ │                     │ │   ➕    │   👥   ││ │
│ │ [View All Alerts]   │ │Product  │ Team  ││ │
│ │                     │ └─────────┴─────────┘│ │
│ ├─────────────────────┼─────────────────────┤ │
│ │ 📈 Inventory Trends │ 📝 Recent Activity  │ │
│ │                     │                     │ │
│ │ [Chart Area]        │ • Mike added 6x...  │ │
│ │                     │ • Sarah adjusted... │ │
│ │                     │ • Low stock alert...│ │
│ │                     │                     │ │
│ │                     │ [View All Activity] │ │
│ └─────────────────────┴─────────────────────┘ │
└───────────────────────────────────────────────┘
```

## Dashboard Personalization

### Customizable Widgets
- **Widget Order**: Drag and drop reordering
- **Widget Visibility**: Show/hide sections
- **Metric Selection**: Choose which stats to display
- **Alert Thresholds**: Customize alert sensitivity

## Data Updates

### Data Fetching & Caching
- **React Query** for efficient data fetching and caching
- **Automatic Background Refetch** for fresh data
- **Optimistic Updates** for immediate feedback
- **Error Handling** with retry mechanisms

### Update Indicators
```
Real-time indicators:
┌─────────────────────────────────┐
│ 📊 Quick Stats            🔄   │ ← Sync indicator
│ Last updated: Just now          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🚨 Alerts (7)      ⚡ NEW (2)  │ ← New alert badge
└─────────────────────────────────┘
```

## Empty States

### No Alerts State
```
┌─────────────────────────────────┐
│ 🚨 Alerts                      │
│                                 │
│        ✅ All good!             │
│   No alerts at this time       │
│                                 │
│   Your inventory levels are     │
│   healthy across all products.  │
└─────────────────────────────────┘
```

### No Activity State
```
┌─────────────────────────────────┐
│ 📝 Recent Activity             │
│                                 │
│        📭 No recent activity    │
│                                 │
│   Get started by adding your    │
│   first products or adjusting   │
│   stock levels.                 │
│                                 │
│   [Add First Product]           │
└─────────────────────────────────┘
```

## Mobile-Specific Interactions

### Touch Gestures
- **Pull to Refresh**: Update all dashboard data
- **Swipe on Alerts**: Quick actions (acknowledge, adjust)
- **Long Press Stats**: View detailed breakdown
- **Pinch to Zoom**: Future chart interactions

### Performance Optimizations
- **Lazy Loading**: Load sections as user scrolls
- **Image Optimization**: WebP for product images
- **Infinite Scroll**: For activity timeline
- **Virtual Scrolling**: For large alert lists

## Accessibility Features

### Screen Reader Support
- **Section Headers**: Proper heading hierarchy
- **Data Tables**: Table headers for stats
- **Live Regions**: For real-time updates
- **Action Descriptions**: Clear button labeling

### Keyboard Navigation
- **Tab Order**: Logical progression through elements
- **Shortcuts**: Quick access to common actions
- **Focus Management**: Clear visual indicators
- **Skip Links**: Jump to main content

### Color Accessibility
- **High Contrast**: WCAG AA compliant ratios
- **Color Independence**: Never color-only information
- **Status Indicators**: Icons + text for alerts
- **Focus Indicators**: Gold glow for interactive elements

This dashboard provides a comprehensive, accessible, and efficient starting point for users to manage their bar inventory while maintaining the sophisticated Barback design aesthetic.
