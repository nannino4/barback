# Settings UI Specifications

## Overview

The Settings system provides comprehensive control over user preferences, organization settings, app configuration, and account management. Following the mobile-first principle, the theme toggle is located here rather than in the main header.

## Settings Main Menu (`/settings`)

### Mobile Settings Layout
```
┌─────────────────────────────────┐
│ ← Back         Settings         │
├─────────────────────────────────┤
│                                 │
│ 👤 Profile                     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 👤 Personal Settings    │ →   │ ← User profile section
│ │    Name, email, phone   │     │
│ └─────────────────────────┘     │
│                                 │
│ 🏢 Organization                 │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🏢 Organization Details │ →   │ ← Current org settings
│ │    The Golden Hour      │     │
│ ├─────────────────────────┤     │
│ │ 👥 Team Management      │ →   │
│ │    5 members            │     │
│ ├─────────────────────────┤     │
│ │ 💳 Subscription         │ →   │
│ │    Free Trial (8 days)  │     │
│ └─────────────────────────┘     │
│                                 │
│ 📱 App Settings                 │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🎨 Appearance           │ →   │ ← Theme toggle here!
│ │    Dark theme           │     │
│ ├─────────────────────────┤     │
│ │ 📱 Notifications        │ →   │
│ │    Push, email prefs    │     │
│ ├─────────────────────────┤     │
│ │ 📊 Data & Storage       │ →   │
│ │    Export, sync         │     │
│ ├─────────────────────────┤     │
│ │ 🔒 Privacy & Security   │ →   │
│ │    Password, 2FA        │     │
│ └─────────────────────────┘     │
│                                 │
│ ❓ Support                      │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ❓ Help & Support       │ →   │
│ │    FAQ, contact us      │     │
│ ├─────────────────────────┤     │
│ │ 📄 Legal                │ →   │
│ │    Terms, privacy       │     │
│ ├─────────────────────────┤     │
│ │ 🔄 About Barback        │ →   │
│ │    Version 1.0.0        │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🚪 Sign Out             │     │ ← Destructive action
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Settings Menu Components
```tsx
<SettingsMenu>
├── <SettingsSection title="Profile">
│   └── <SettingsItem 
│       to="/settings/profile"
│       icon={<User />}
│       title="Personal Settings"
│       subtitle="Name, email, phone"
│     />
├── <SettingsSection title="Organization">
│   ├── <SettingsItem 
│       to="/settings/organization"
│       icon={<Building />}
│       title="Organization Details"
│       subtitle={currentOrg.name}
│     />
│   ├── <SettingsItem 
│       to="/settings/team"
│       icon={<Users />}
│       title="Team Management"
│       subtitle={`${memberCount} members`}
│     />
│   └── <SettingsItem 
│       to="/settings/subscription"
│       icon={<CreditCard />}
│       title="Subscription"
│       subtitle={subscriptionStatus}
│     />
├── <SettingsSection title="App Settings">
│   ├── <SettingsItem 
│       to="/settings/appearance"
│       icon={<Palette />}
│       title="Appearance"
│       subtitle={currentTheme}
│     />
│   ├── <SettingsItem 
│       to="/settings/notifications"
│       icon={<Bell />}
│       title="Notifications"
│       subtitle="Push, email preferences"
│     />
│   ├── <SettingsItem 
│       to="/settings/data"
│       icon={<Database />}
│       title="Data & Storage"
│       subtitle="Export, sync"
│     />
│   └── <SettingsItem 
│       to="/settings/security"
│       icon={<Shield />}
│       title="Privacy & Security"
│       subtitle="Password, 2FA"
│     />
├── <SettingsSection title="Support">
│   ├── <SettingsItem 
│       to="/settings/help"
│       icon={<HelpCircle />}
│       title="Help & Support"
│       subtitle="FAQ, contact us"
│     />
│   ├── <SettingsItem 
│       to="/settings/legal"
│       icon={<FileText />}
│       title="Legal"
│       subtitle="Terms, privacy"
│     />
│   └── <SettingsItem 
│       to="/settings/about"
│       icon={<Info />}
│       title="About Barback"
│       subtitle={`Version ${appVersion}`}
│     />
└── <SignOutButton />
```

## Appearance Settings (`/settings/appearance`)

### Theme Selection Interface
```
┌─────────────────────────────────┐
│ ← Back      Appearance          │
├─────────────────────────────────┤
│                                 │
│ 🎨 Theme                        │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ⚫ Dark Theme           │     │ ← Radio selection
│ │   ✓ Currently active    │     │   (currently selected)
│ │   Perfect for bars      │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ⚪ Light Theme          │     │ ← Alternative option
│ │   Classic bright look   │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🔄 System Theme         │     │ ← System preference
│ │   Follow device setting │     │
│ └─────────────────────────┘     │
│                                 │
│ 🔧 Interface                    │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Text Size        Normal │     │ ← Text scaling
│ │ ──●─────────────────    │     │   (slider control)
│ │ Small   Normal   Large  │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Animation Speed  Normal │     │ ← Animation preferences
│ │ ────────●───────────    │     │
│ │ Slow    Normal   Fast   │     │
│ ├─────────────────────────┤     │
│ │ ☑️ Reduce Motion        │     │ ← Accessibility option
│ │   For accessibility     │     │
│ └─────────────────────────┘     │
│                                 │
│ 🎯 Density                      │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ⚫ Comfortable           │     │ ← Spacing options
│ │   Standard spacing      │     │
│ ├─────────────────────────┤     │
│ │ ⚪ Compact               │     │
│ │   More items per screen │     │
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Theme Components
```tsx
<AppearanceSettings>
├── <ThemeSelector>
│   ├── <ThemeOption 
│       value="dark" 
│       selected={theme === 'dark'}
│       title="Dark Theme"
│       description="Perfect for bars"
│       preview={<DarkThemePreview />}
│     />
│   ├── <ThemeOption 
│       value="light" 
│       selected={theme === 'light'}
│       title="Light Theme"
│       description="Classic bright look"
│       preview={<LightThemePreview />}
│     />
│   └── <ThemeOption 
│       value="system" 
│       selected={theme === 'system'}
│       title="System Theme"
│       description="Follow device setting"
│       preview={<SystemThemePreview />}
│     />
├── <InterfaceSettings>
│   ├── <SliderSetting 
│       label="Text Size"
│       value={textSize}
│       min={0.8}
│       max={1.4}
│       step={0.1}
│       labels={['Small', 'Normal', 'Large']}
│     />
│   ├── <SliderSetting 
│       label="Animation Speed"
│       value={animationSpeed}
│       options={['Slow', 'Normal', 'Fast']}
│     />
│   └── <ToggleSetting 
│       label="Reduce Motion"
│       description="For accessibility"
│       value={reduceMotion}
│     />
└── <DensitySelector>
    ├── <DensityOption value="comfortable" selected />
    └── <DensityOption value="compact" />
```

## Personal Settings (`/settings/profile`)

### Profile Management Interface
```
┌─────────────────────────────────┐
│ ← Back      Personal Settings   │
├─────────────────────────────────┤
│                                 │
│ 👤 Profile Information          │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 📷          [Change]    │     │ ← Profile photo
│ │  JD                     │     │   (initials placeholder)
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ First Name         Edit │ ←   │ ← Editable fields
│ │ John                    │     │   (tap to edit)
│ ├─────────────────────────┤     │
│ │ Last Name          Edit │ ←   │
│ │ Doe                     │     │
│ ├─────────────────────────┤     │
│ │ Email Address      Edit │ ←   │
│ │ john@example.com        │     │
│ ├─────────────────────────┤     │
│ │ Phone Number       Edit │ ←   │
│ │ +39 333 123 4567        │     │
│ └─────────────────────────┘     │
│                                 │
│ 🔐 Account Security             │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🔑 Change Password      │ →   │
│ ├─────────────────────────┤     │
│ │ 🛡️ Two-Factor Auth      │ →   │
│ │    Not enabled          │     │
│ ├─────────────────────────┤     │
│ │ 📱 Connected Accounts   │ →   │
│ │    Google               │     │
│ └─────────────────────────┘     │
│                                 │
│ 📊 Account Stats                │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Member since: Jan 2024  │     │ ← Account info
│ │ Last login: 2 hours ago │     │
│ │ Organizations: 2        │     │
│ └─────────────────────────┘     │
│                                 │
│ ⚠️ Account Actions              │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 📤 Export My Data       │     │ ← GDPR compliance
│ ├─────────────────────────┤     │
│ │ 🗑️ Delete Account       │     │ ← Destructive action
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

## Notification Settings (`/settings/notifications`)

### Notification Preferences
```
┌─────────────────────────────────┐
│ ← Back      Notifications       │
├─────────────────────────────────┤
│                                 │
│ 📱 Push Notifications           │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ☑️ Enable Push Notifications│  │ ← Master toggle
│ └─────────────────────────┘     │
│                                 │
│ Notification Types:             │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ☑️ Low Stock Alerts      │     │ ← Individual toggles
│ │    When stock is low     │     │
│ ├─────────────────────────┤     │
│ │ ☑️ Stock Adjustments     │     │
│ │    When stock is updated │     │
│ ├─────────────────────────┤     │
│ │ ☐ Team Activity          │     │
│ │    Member actions        │     │
│ ├─────────────────────────┤     │
│ │ ☑️ System Updates        │     │
│ │    App updates, sync     │     │
│ └─────────────────────────┘     │
│                                 │
│ 📧 Email Notifications          │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ☑️ Weekly Reports        │     │
│ │    Inventory summary     │     │
│ ├─────────────────────────┤     │
│ │ ☑️ Critical Alerts       │     │
│ │    Urgent issues only    │     │
│ ├─────────────────────────┤     │
│ │ ☐ Marketing Updates      │     │
│ │    Features, tips        │     │
│ └─────────────────────────┘     │
│                                 │
│ ⏰ Quiet Hours                  │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ☑️ Enable Quiet Hours    │     │
│ ├─────────────────────────┤     │
│ │ From    22:00           │     │ ← Time pickers
│ │ To      08:00           │     │
│ ├─────────────────────────┤     │
│ │ Days                    │     │
│ │ ☑️ Mon ☑️ Tue ☑️ Wed    │     │ ← Day selection
│ │ ☑️ Thu ☑️ Fri ☐ Sat    │     │
│ │ ☐ Sun                   │     │
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

## Privacy & Security Settings (`/settings/security`)

### Security Management
```
┌─────────────────────────────────┐
│ ← Back    Privacy & Security    │
├─────────────────────────────────┤
│                                 │
│ 🔐 Authentication               │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🔑 Password             │ →   │ ← Change password
│ │    Last changed 2 months│     │
│ ├─────────────────────────┤     │
│ │ 🛡️ Two-Factor Auth       │ →   │ ← 2FA setup
│ │    ⚠️ Not enabled       │     │
│ ├─────────────────────────┤     │
│ │ 📱 Trusted Devices      │ →   │ ← Device management
│ │    3 devices            │     │
│ └─────────────────────────┘     │
│                                 │
│ 🔒 Privacy Controls             │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 👁️ Profile Visibility    │ →   │ ← Who can see profile
│ │    Team members only    │     │
│ ├─────────────────────────┤     │
│ │ 📊 Activity Visibility   │ →   │ ← Activity sharing
│ │    Organization only    │     │
│ ├─────────────────────────┤     │
│ │ 🔍 Search Visibility     │ →   │ ← Discoverable in search
│ │    Enabled              │     │
│ └─────────────────────────┘     │
│                                 │
│ 📱 Data & Analytics             │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ☑️ Usage Analytics       │     │ ← Anonymous usage data
│ │    Help improve Barback  │     │
│ ├─────────────────────────┤     │
│ │ ☐ Crash Reports          │     │ ← Error reporting
│ │    Automatic bug reports │     │
│ ├─────────────────────────┤     │
│ │ ☑️ Performance Metrics   │     │ ← Performance data
│ │    App performance data  │     │
│ └─────────────────────────┘     │
│                                 │
│ 🏛️ Data Rights                  │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 📤 Download My Data      │     │ ← GDPR data export
│ ├─────────────────────────┤     │
│ │ 🗑️ Delete My Data        │     │ ← GDPR data deletion
│ ├─────────────────────────┤     │
│ │ 📄 Privacy Policy        │     │ ← Legal documents
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

## Data & Storage Settings (`/settings/data`)

### Data Management Interface
```
┌─────────────────────────────────┐
│ ← Back      Data & Storage      │
├─────────────────────────────────┤
│                                 │
│ 💾 Storage Usage                │
│                                 │
│ ┌─────────────────────────┐     │
│ │ App Data: 12.3 MB       │     │ ← Storage breakdown
│ │ ████████████░░░░░░░░░   │     │   Visual storage bar
│ │ Photos: 2.1 MB          │     │
│ │ Cache: 5.7 MB           │     │
│ │ Documents: 4.5 MB       │     │
│ └─────────────────────────┘     │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🧹 Clear Cache          │     │ ← Cache management
│ │    Free up 5.7 MB       │     │
│ ├─────────────────────────┤     │
│ │ 📷 Manage Photos         │ →   │ ← Photo management
│ │    2 product photos      │     │
│ └─────────────────────────┘     │
│                                 │
│ 🔄 Sync & Backup                │
│                                 │
│ ┌─────────────────────────┐     │
│ │ ☑️ Auto Sync             │     │ ← Sync preferences
│ │    Keep data up to date  │     │
│ ├─────────────────────────┤     │
│ │ ☑️ Offline Access        │     │ ← Offline capability
│ │    Cache for offline use │     │
│ ├─────────────────────────┤     │
│ │ 📶 Sync on WiFi Only     │     │ ← Network preferences
│ │    ☑️ Enabled            │     │
│ └─────────────────────────┘     │
│                                 │
│ 📤 Export Options               │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 📊 Export Inventory      │     │ ← Data export
│ │    CSV, Excel formats    │     │
│ ├─────────────────────────┤     │
│ │ 📈 Export Reports        │     │
│ │    Analytics data        │     │
│ ├─────────────────────────┤     │
│ │ 📋 Export All Data       │     │ ← Full export
│ │    Complete backup       │     │
│ └─────────────────────────┘     │
│                                 │
│ Last sync: 5 minutes ago        │ ← Sync status
│ Next backup: Tomorrow 3:00 AM   │
└─────────────────────────────────┘
```

## Help & Support (`/settings/help`)

### Support Interface
```
┌─────────────────────────────────┐
│ ← Back      Help & Support      │
├─────────────────────────────────┤
│                                 │
│ 🔍 Search Help                  │
│ ┌─────────────────────────┐     │
│ │ 🔍 How can we help?     │     │ ← Search help articles
│ └─────────────────────────┘     │
│                                 │
│ 📚 Quick Help                   │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 🚀 Getting Started      │ →   │ ← Common topics
│ │    Setup and basics      │     │
│ ├─────────────────────────┤     │
│ │ 📦 Managing Inventory    │ →   │
│ │    Products and stock    │     │
│ ├─────────────────────────┤     │
│ │ 👥 Team Management       │ →   │
│ │    Invites and roles     │     │
│ ├─────────────────────────┤     │
│ │ 💳 Billing & Plans       │ →   │
│ │    Subscriptions         │     │
│ └─────────────────────────┘     │
│                                 │
│ 💬 Contact Support              │
│                                 │
│ ┌─────────────────────────┐     │
│ │ 📧 Email Support        │ →   │ ← Email support only
│ │    Get help via email    │     │
│ └─────────────────────────┘     │
│                                 │
│ 📱 App Information              │
│                                 │
│ ┌─────────────────────────┐     │
│ │ Version: 1.0.0          │     │ ← App details
│ │ Build: 2024.01.15       │     │
│ │ Last updated: 2 days ago│     │
│ ├─────────────────────────┤     │
│ │ 🔄 Check for Updates    │     │ ← Update check
│ ├─────────────────────────┤     │
│ │ 🐛 Report a Bug         │ →   │ ← Bug reporting
│ ├─────────────────────────┤     │
│ │ 💡 Request a Feature    │ →   │ ← Feature requests
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

## Mobile-Specific Settings Behavior

### Navigation Patterns
- **Hierarchical Navigation**: Each setting category opens a new screen
- **Back Button**: Always present for returning to previous level
- **Search**: Global search within help sections
- **Quick Access**: Frequently used settings promoted to top level

### Touch Interactions
- **Tap**: Navigate to setting or toggle simple options
- **Long Press**: Access context menus (copy, share settings)
- **Swipe**: Navigate between setting categories (tablet)
- **Pull to Refresh**: Check for updates or sync status

### Accessibility Features
- **Large Touch Targets**: All interactive elements 44px minimum
- **High Contrast**: Settings respect system accessibility preferences
- **Voice Control**: Full compatibility with device accessibility features
- **Screen Reader**: Comprehensive ARIA labels and descriptions

### Data Persistence
- **Immediate Saving**: Changes saved automatically
- **Sync Indicators**: Clear feedback when settings sync across devices
- **Offline Support**: Settings cached for offline access
- **Conflict Resolution**: Clear handling of sync conflicts

This settings system provides comprehensive control over the Barback experience while maintaining the sophisticated, mobile-first design approach. The placement of appearance settings (including theme toggle) within the settings menu follows mobile UX best practices by keeping non-essential UI elements out of the primary navigation flow.
