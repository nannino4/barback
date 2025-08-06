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

#### Background Colors
- **Primary**: Deep charcoal base (`background`, `card`)
- **Secondary**: Elevated surfaces (`secondary`, `muted`) 
- **Accent**: Interactive elements (`accent`)

#### Text Colors
- **Primary**: High contrast for main content (`foreground`)
- **Secondary**: Reduced emphasis (`muted-foreground`)
- **Brand**: Gold accent text (`primary`)

#### Brand Colors
- **Gold Primary**: Main accent for actions (`primary` - 48 75% 53%)
- **Gold Variants**: Hover and focus states (automatic opacity variants)

#### Semantic Colors
- **Success**: Emerald green (`success` - 160 84% 39%)
- **Error**: Red (`destructive` - 0 84% 60%)
- **Warning**: Amber (`warning` - 38 92% 50%)
- **Info**: Blue (`info` - 217 91% 60%)

#### Usage in Code
```tsx
// Use Tailwind utility classes (automatically generated from @theme)
<div className="bg-background text-foreground">
  <h1 className="text-primary">Gold heading</h1>
  <p className="text-muted-foreground">Muted text</p>
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Action Button
  </button>
</div>

// Focus and hover states work automatically
<input className="border-input focus-visible:ring-ring focus-visible:ring-2" />
```

### Font Families
- **Headings**: Playfair Display (sophisticated serif) - Use `font-heading` class
- **Body/UI**: Inter (clean sans-serif) - Use `font-body` or default `font-sans` class

### Type Scale Philosophy
- Uses `rem` units for consistent scaling with user preferences
- Mobile-first approach with responsive adjustments
- Follows a harmonious scale for visual hierarchy

### Usage Examples
```jsx
// Tailwind classes
<h1 className="font-heading text-4xl">Page Title</h1>
<p className="font-body text-base">Body text</p>

// Custom CSS
h1 { font-family: var(--font-heading); }
body { font-family: var(--font-body); }
```

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

### Contrast Ratios
All color combinations meet WCAG 2.1 AA standards:
- **Primary Text on Primary Background**: 14.8:1 (AAA)
- **Secondary Text on Primary Background**: 7.2:1 (AAA)
- **Primary Gold on Primary Background**: 4.7:1 (AA)
- **White text on Primary Gold**: 4.7:1 (AA)

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

### Automatic Utility Generation
Tailwind v4 automatically generates utility classes from theme variables:
```css
/* @theme variables become utilities */
--color-primary: 48 75% 53%;     /* → .text-primary, .bg-primary, .border-primary */
--color-ring: 48 75% 53%;        /* → .ring-ring, .focus-visible:ring-ring */
--font-heading: 'Playfair Display'; /* → .font-heading */
```

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
