# Main Application UI Specifications

## Overview

The main application layout provides the core structure for the Barback inventory management system, featuring a mobile-first design with header navigation, search functionality, and bottom tab navigation.

## Main Layout Structure

### Mobile Layout (320px - 768px)
```
┌─────────────────────────────────┐
│ Header (56px)                   │ ← Compact header
├─────────────────────────────────┤
│                                 │
│                                 │
│        Main Content             │ ← Full viewport height
│        (Scrollable)             │   minus header/nav
│                                 │
│                                 │
├─────────────────────────────────┤
│ Bottom Navigation (64px)        │ ← Primary navigation
└─────────────────────────────────┘
```

### Tablet Layout (768px - 1024px)
```
┌─────────────────────────────────────────┐
│ Header (64px)                           │ ← Expanded header
├─────────────────────────────────────────┤
│ Side │                                │
│ Nav  │        Main Content            │ ← Sidebar + content
│(240) │        (Scrollable)            │
│      │                                │
└─────────────────────────────────────────┘
```

### Desktop Layout (1024px+)
```
┌───────────────────────────────────────────────┐
│ Header (72px)                                 │ ← Full header
├───────────────────────────────────────────────┤
│ Side │                    │ Context    │
│ Nav  │   Main Content     │ Panel      │ ← Three-column
│(280) │   (Fluid)          │ (320)      │
│      │                    │            │
└───────────────────────────────────────────────┘
```

## Header Component

### Mobile Header (`< 768px`)
```
┌─────────────────────────────────┐
│ 🔍 Search products...           │ ← Product search only
└─────────────────────────────────┘
```

### Tablet/Desktop Header (`≥ 768px`)
```
┌─────────────────────────────────────────────────┐
│ 🍸 Barback    🔍 Search products...   👤 User ▼│
│ Logo/Title    Product Search Bar      User Menu │
└─────────────────────────────────────────────────┘
```

### Mobile Header Components
```tsx
<MobileHeader>
└── <ProductSearchBar />
```

### Desktop Header Components
```tsx
<DesktopHeader>
├── <Logo />
├── <HeaderTitle>Barback</HeaderTitle>
├── <ProductSearchBar />
├── <HeaderActions>
│   ├── <NotificationBell />
│   └── <UserMenu />
└── <OrganizationSwitcher />
```

## Product Search Bar

### Search Bar States

#### Default State
```
┌─────────────────────────────────┐
│ 🔍 Search products...           │ ← Product search only
└─────────────────────────────────┘
```

#### Focused State
```
┌─────────────────────────────────┐
│ 🔍 johnnie walker              │ ← User input
└─────────────────────────────────┘
┌─────────────────────────────────┐ ← Search results dropdown
│ 🥃 Products (3)                 │
│ • Johnnie Walker Black Label    │
│ • Johnnie Walker Red Label      │
│ • Johnnie Walker Blue Label     │
│ ──────────────────────────      │
│ 👤 People (1)                   │
│ • John Walker (Manager)         │
│ ──────────────────────────      │
│ 📊 Recent Searches              │
│ • Vodka inventory               │
│ • Low stock alerts              │
└─────────────────────────────────┘
```

#### Mobile Search (Full Screen Modal)
```
┌─────────────────────────────────┐
│ ← Back    🔍 Search...     ✕   │ ← Full screen search
├─────────────────────────────────┤
│                                 │
│ Recent Searches                 │
│ • Vodka inventory               │
│ • Low stock alerts              │
│ • Team members                  │
│                                 │
│ Quick Filters                   │
│ [Products] [People] [Reports]   │ ← Filter chips
│                                 │
│ Suggestions                     │
│ • Check Grey Goose stock        │
│ • View inventory reports        │
│ • Add new product               │
└─────────────────────────────────┘
```

### Search Components
```tsx
// Desktop/Tablet search
<GlobalSearchBar>
├── <SearchInput 
│     placeholder="Search products, members..." 
│     onFocus={showResults}
│   />
└── <SearchResults>
    ├── <SearchSection title="Products" items={productResults} />
    ├── <SearchSection title="People" items={memberResults} />
    └── <RecentSearches items={recentSearches} />

// Mobile search modal
<MobileSearchModal>
├── <SearchHeader>
│   ├── <BackButton />
│   ├── <SearchInput />
│   └── <CloseButton />
├── <RecentSearches />
├── <QuickFilters filters={['Products', 'People', 'Reports']} />
└── <SearchSuggestions />
```

### Search Functionality
- **Global search** across products, team members, and content
- **Real-time suggestions** as user types
- **Recent searches** for quick access
- **Category filtering** (Products, People, Reports)
- **Keyboard shortcuts** (Cmd/Ctrl + K to focus)

## Bottom Navigation (Mobile Primary)

### Mobile Bottom Navigation
```
┌─────────────────────────────────┐
│    🏠      📦      ⚙️           │
│   Home   Stock  Settings        │
│    •             ←active        │
└─────────────────────────────────┘
```

### Navigation Items
1. **Home** (`/dashboard`) - Dashboard and overview
2. **Stock** (`/inventory`) - Inventory management  
3. **Settings** (`/settings`) - User and app settings

### Bottom Navigation Component
```tsx
<BottomNavigation>
├── <NavItem 
│     to="/dashboard" 
│     icon={Home} 
│     label="Home" 
│     active={pathname === '/dashboard'}
│   />
├── <NavItem 
│     to="/inventory" 
│     icon={Package} 
│     label="Stock" 
│     badge={lowStockCount} // Optional badge for alerts
│   />
└── <NavItem 
│     to="/settings" 
│     icon={Settings} 
│     label="Settings"
│   />
```

### Navigation States
- **Active**: Gold color with dot indicator
- **Inactive**: Secondary text color
- **Badge**: Red dot with count for notifications/alerts
- **Disabled**: Grayed out (if access restricted)

## Sidebar Navigation (Tablet/Desktop)

### Tablet Sidebar (768px+)
```
┌─────────────────────────────┐
│                             │
│ 🏠 Dashboard                │ ← Navigation items
│ 📦 Inventory                │
│    • Products               │ ← Submenu items
│    • Categories             │
│    • Adjustments            │
│ 📊 Analytics                │
│ 👥 Team                     │
│ ⚙️ Settings                 │
│                             │
│ ──────────────────────      │
│                             │
│ 🏢 The Golden Hour     ▼    │ ← Org switcher
│                             │
│ 👤 John Smith               │ ← User info
│    Owner                    │
│                             │
└─────────────────────────────┘
```

### Sidebar Components
```tsx
<Sidebar>
├── <SidebarNavigation>
│   ├── <NavGroup title="Main">
│   │   ├── <NavItem to="/dashboard" icon={Home} label="Dashboard" />
│   │   ├── <NavItem to="/inventory" icon={Package} label="Inventory">
│   │   │   ├── <SubNavItem to="/inventory/products" label="Products" />
│   │   │   ├── <SubNavItem to="/inventory/categories" label="Categories" />
│   │   │   └── <SubNavItem to="/inventory/adjustments" label="Adjustments" />
│   │   ├── <NavItem to="/analytics" icon={BarChart3} label="Analytics" />
│   │   ├── <NavItem to="/team" icon={Users} label="Team" />
│   │   └── <NavItem to="/settings" icon={Settings} label="Settings" />
├── <Divider />
├── <OrganizationSwitcher />
└── <UserProfile />
```

## Hamburger Menu (Mobile)

### Mobile Hamburger Menu
```
┌─────────────────────────────────┐
│ ✕                               │ ← Close button
│                                 │
│ 👤 John Smith                   │ ← User profile
│    Owner at The Golden Hour     │
│    john@email.com               │
│                                 │
│ ──────────────────────────      │
│                                 │
│ 🏢 Switch Organization          │ ← Organization actions
│ 👥 Manage Team                  │
│ 💳 Billing & Subscription       │
│                                 │
│ ──────────────────────────      │
│                                 │
│ 📱 App Settings                 │ ← App-level settings
│ 🎨 Appearance                   │   (theme is here!)
│ 📧 Notifications                │
│ 🔒 Privacy & Security           │
│                                 │
│ ──────────────────────────      │
│                                 │
│ ❓ Help & Support               │ ← Support options
│ 📄 Terms & Privacy              │
│ 🚪 Sign Out                     │ ← Sign out
│                                 │
└─────────────────────────────────┘
```

### Hamburger Menu Component
```tsx
<HamburgerMenu>
├── <UserProfileSection>
│   ├── <UserAvatar />
│   ├── <UserName />
│   ├── <UserRole />
│   └── <UserEmail />
├── <Divider />
├── <MenuSection title="Organization">
│   ├── <MenuItem to="/organizations" icon={Building} label="Switch Organization" />
│   ├── <MenuItem to="/team" icon={Users} label="Manage Team" />
│   └── <MenuItem to="/billing" icon={CreditCard} label="Billing & Subscription" />
├── <Divider />
├── <MenuSection title="App">
│   ├── <MenuItem to="/settings/app" icon={Smartphone} label="App Settings" />
│   ├── <MenuItem to="/settings/appearance" icon={Palette} label="Appearance" />
│   ├── <MenuItem to="/settings/notifications" icon={Bell} label="Notifications" />
│   └── <MenuItem to="/settings/privacy" icon={Shield} label="Privacy & Security" />
├── <Divider />
├── <MenuSection title="Support">
│   ├── <MenuItem to="/help" icon={HelpCircle} label="Help & Support" />
│   ├── <MenuItem to="/legal" icon={FileText} label="Terms & Privacy" />
│   └── <SignOutButton />
```

## User Menu (Desktop)

### Desktop User Dropdown
```
┌─────────────────────────────────┐
│ 👤 John Smith              ▼   │ ← Header user menu trigger
└─────────────────────────────────┘

┌─────────────────────────────────┐ ← Dropdown menu
│ 👤 Profile Settings             │
│ 🏢 Organization Settings        │
│ 👥 Team Management              │
│ ──────────────────────────      │
│ 💳 Billing & Subscription       │
│ 📧 Notifications                │
│ 🎨 Appearance                   │
│ ──────────────────────────      │
│ ❓ Help & Support               │
│ 🚪 Sign Out                     │
└─────────────────────────────────┘
```

## Responsive Behavior

### Breakpoint Adaptations

#### Mobile (< 768px)
- **Header**: Compact with hamburger menu
- **Navigation**: Bottom tabs only
- **Search**: Full-screen modal
- **Content**: Single column, full width

#### Tablet (768px - 1024px)
- **Header**: Expanded with search bar
- **Navigation**: Sidebar + bottom tabs (optional)
- **Search**: Dropdown results
- **Content**: Two-column layouts

#### Desktop (≥ 1024px)
- **Header**: Full header with all features
- **Navigation**: Sidebar only
- **Search**: Dropdown with rich results
- **Content**: Multi-column layouts

### Touch Interactions

#### Mobile Touch Patterns
- **Tap**: Navigate, select, open
- **Long Press**: Context menus, multi-select
- **Swipe**: Dismiss, navigate back
- **Pull to Refresh**: Update content

#### Navigation Gestures
- **Swipe Right**: Open hamburger menu (from left edge)
- **Swipe Left**: Close hamburger menu
- **Tap Outside**: Close menus and modals

## Loading States

### Header Loading
```
┌─────────────────────────────────┐
│ ☰   🍸 ████████         ●●●    │ ← Skeleton loading
└─────────────────────────────────┘
```

### Search Loading
```
┌─────────────────────────────────┐
│ 🔍 johnnie walker              │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 🔄 Searching...                 │ ← Loading indicator
│ ████████████████████            │ ← Skeleton results
│ ████████████████                │
│ ████████████████████████        │
└─────────────────────────────────┘
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate through interactive elements
- **Enter**: Activate buttons and links
- **Escape**: Close menus and modals
- **Cmd/Ctrl + K**: Focus search bar

### Screen Reader Support
- **ARIA labels** for all navigation elements
- **Role indicators** for current page
- **State announcements** for menu open/close
- **Search result counts** announced

### Focus Management
- **Visible focus** indicators with gold glow
- **Focus trap** in modals and menus
- **Focus restoration** when closing overlays

This main application structure provides a solid, accessible foundation for the Barback inventory management system while maintaining the sophisticated mobile-first design.
