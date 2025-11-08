# Barback Design System - "The Speakeasy"

## Overview

The Barback design system embodies the sophisticated, premium atmosphere of an exclusive cocktail lounge. This mobile-first, dark-themed design creates an elegant and professional experience that's optimized for touch interactions and easy on the eyes in dimly lit bar environments while maintaining excellent readability and accessibility across all device sizes.

## Brand Personality

- **Mobile-First**: Optimized for touch interactions and small screens as the primary experience
- **Sophisticated**: Premium feel that reflects the craft of mixology
- **Professional**: Trustworthy and efficient for business operations
- **Elegant**: Classic design elements with modern functionality
- **Accessible**: Optimized for low-light environments common in bars and all device capabilities

## Color System

The color palette follows Tailwind v4 conventions using the `@theme` directive in `src/index.css` for automatic utility class generation.

### Color Categories

#### Surface Colors (Background Hierarchy)
- **background**: Page base layer - main app background
- **card**: Elevated surfaces - cards, panels, dialogs  
- **popover**: Floating surfaces - dropdowns, tooltips (currently same as card)
- **input**: Form field backgrounds - inputs, textareas
- **muted**: Secondary content areas - disabled states, hover backgrounds

#### Text Colors
- **foreground**: High contrast text for main content
- **muted-foreground**: Reduced emphasis text for descriptions, labels
- **card-foreground**: Text on card surfaces
- **primary-foreground**: Text on primary colored backgrounds

#### Brand Colors
- **primary**: Gold accent (`oklch(0.78 0.18 93)` dark / `oklch(0.62 0.20 85)` light)
- **secondary**: Secondary interactive elements (muted appearance)
- **accent**: Tertiary interactive elements (subtle emphasis between secondary and muted)
- **ring**: Focus ring color (matches primary)

#### Semantic Colors
- **success**: Emerald green for positive feedback
- **destructive**: Red for errors and destructive actions
- **warning**: Amber for warnings and caution
- **info**: Blue for informational messages

#### Interactive Elements
- **border**: Default border color for dividers and outlines
- **ring**: Focus ring color (gold, matches primary)

#### Usage in Code
```tsx
// Use Tailwind utility classes (automatically generated from @theme)
<div className="bg-background text-foreground">
  <Card className="bg-card">  {/* Auto-applied by Card component */}
    <h1 className="text-primary">Gold heading</h1>
    <p className="text-muted-foreground">Secondary text</p>
  </Card>
  
  <Input className="bg-input" />  {/* Auto-applied by Input component */}
  
  {/* Button variants showcase color hierarchy */}
  <Button variant="default">Primary Action</Button>
  <Button variant="secondary">Secondary Action</Button>
  <Button variant="accent">Tertiary Action</Button>
</div>

// Focus and hover states work automatically
<input className="border-input focus-visible:ring-ring focus-visible:ring-[3px]" />
```

### Font Families
- **Headings**: Playfair Display (sophisticated serif) - Use `font-heading` class
- **Body/UI**: Inter (clean sans-serif) - Use `font-body` or default `font-sans` class

### Type Scale Philosophy
- Uses `rem` units for consistent scaling with user preferences
- Mobile-first approach with responsive adjustments
- Follows a harmonious scale for visual hierarchy

### Weight Guidelines
- **300 (Light)**: Large headings, subtle emphasis
- **400 (Regular)**: Default body text
- **500 (Medium)**: Labels, emphasized text
- **600 (Semibold)**: Strong emphasis
- **700 (Bold)**: Headings, very strong emphasis

## Spacing & Layout

### Spacing Philosophy
- **4px base unit**: All spacing follows consistent increments
- **Mobile-first**: Base styles optimized for touch interfaces
- **Touch targets**: Minimum 44px (`space-touch`) for interactive elements

### Usage
```jsx
// Tailwind spacing classes (4px increments)
<div className="p-4 m-2 space-y-6">
  <button className="h-touch px-6">Touch-friendly button</button>
</div>
```

## Visual Effects

### Shadows & Elevation
Defined as CSS variables (`--shadow-sm` through `--shadow-xl`) with stronger opacity for dark backgrounds.

### Focus & Interaction States
- **Focus rings**: Gold glow effects (`--glow-gold`)
- **Success feedback**: Green glow (`--glow-success`)  
- **Error feedback**: Red glow (`--glow-error`)

### Border Radius Scale
- **Sharp (0px)**: Modern, minimal elements
- **Subtle (2-4px)**: Default UI elements
- **Rounded (6-12px)**: Cards and prominent elements

## Component Guidelines

### Design Principles
- **Mobile-first**: All components optimized for touch interactions
- **44px minimum**: Touch targets meet accessibility standards
- **Progressive enhancement**: Desktop gets hover states, mobile focuses on touch
- **Consistent theming**: All components use CSS variables for easy theme switching

### Button Patterns
```jsx
// Primary action - gold background
<Button variant="primary">Save Changes</Button>

// Secondary action - gold outline
<Button variant="secondary">Cancel</Button>

// Subtle action - transparent with hover
<Button variant="ghost">Edit</Button>
```

### Form Patterns
- **Touch-friendly**: Larger padding on mobile
- **Clear hierarchy**: Labels use medium weight, proper contrast
- **Focus indicators**: Gold glow effects for accessibility

### Layout Patterns
- **Card containers**: Secondary background with subtle borders
- **Navigation**: Primary background with border accents
- **Modals**: Secondary background with strong shadows

## Accessibility Guidelines

### Focus Management
- All interactive elements have visible focus indicators
- Focus trap implemented in modals and dialogs
- Logical tab order throughout the application

### Motion & Animation
- Respect `prefers-reduced-motion` setting
- Subtle animations with durations under 200ms
- No auto-playing animations or videos

## Implementation Guide

### Tailwind v4 Theme Configuration
All design tokens are defined in `src/index.css` using the `@theme` directive:
- **Colors**: HSL format in `--color-*` namespace for automatic utility generation
- **Typography**: Font families in `--font-*` namespace
- **Shadows**: Pre-defined elevation levels in `--shadow-*` namespace
- **Spacing**: Custom spacing values in `--spacing-*` namespace

### Best Practices
- **Use utility classes**: `text-primary`, `bg-card`, `border-input`
- **Leverage variants**: `hover:bg-primary/90`, `focus-visible:ring-ring`
- **Touch targets**: `h-touch` class for 44px minimum
- **No custom CSS**: Let Tailwind generate all utilities from theme variables

### Theme Switching
```jsx
// Toggle between themes
<html className="dark"> // Default
<html className="light"> // Alternative
```

### Getting Started
1. **Use CSS variables** directly for custom components
2. **Use Tailwind classes** for rapid prototyping  
3. **Install shadcn/ui components** as needed
4. **Follow mobile-first** approach in all implementations

## Layout Components

### Overview
Production-grade layout components that provide consistent spacing and structure throughout the app. These components eliminate the need to remember specific Tailwind classes and ensure visual consistency.

## Feedback Components

### Overview
Consistent components for displaying empty states, errors, loading indicators, and status messages. These ensure a unified user experience across all pages.

## Best Practices

### Spacing Consistency
**Do:**
- Use layout components (PageContainer, Section, Stack, Grid)
- Use the spacing prop values (xs, sm, md, lg, xl)
- Let components handle responsive spacing

**Don't:**
- Use arbitrary spacing values (`mb-[23px]`)
- Mix layout component spacing with manual Tailwind classes
- Use different spacing scales in different parts of the app

### Feedback States
**Do:**
- Always handle loading, error, and empty states
- Use descriptive loading messages
- Provide retry options for errors
- Make empty states actionable when possible

**Don't:**
- Show raw error messages to users
- Use generic "Loading..." everywhere
- Leave users in unclear states (no feedback)
- Nest loading states (show one clear indicator)

### Component Composition
**Do:**
- Use Stack for vertical/horizontal spacing
- Use Grid for card layouts
- Use Section for page-level spacing
- Combine components naturally

**Don't:**
- Wrap everything in unnecessary divs
- Add spacing with multiple wrapping components
- Override component spacing with manual classes

### Mobile-First Approach
**Do:**
- Start with mobile layout
- Use responsive grid columns
- Test on mobile first
- Use touch-friendly targets (44px minimum)

**Don't:**
- Design desktop-first then squeeze into mobile
- Use fixed pixel widths
- Ignore mobile spacing and padding
- Make interactive elements too small
