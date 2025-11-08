# Barback Design System - "The Speakeasy"

## Overview

The Barback design system embodies the sophisticated, premium atmosphere of an exclusive cocktail lounge. This **mobile-first, dark-themed** design creates an elegant and professional experience optimized for touch interactions and easy on the eyes in dimly lit bar environments while maintaining excellent readability and accessibility across all device sizes.

## Brand Personality

- **Mobile-First**: Optimized for touch interactions (44px minimum targets) as the primary experience
- **Sophisticated**: Premium feel that reflects the craft of mixology  
- **Professional**: Trustworthy and efficient for business operations
- **Elegant**: Classic design elements with modern functionality
- **Accessible**: WCAG AA compliant, optimized for low-light bar environments

---

## Color System

All colors use **OKLCH color space** for perceptually uniform brightness and better interpolation. Colors are defined in `src/index.css` using Tailwind v4's `@theme` directive, which automatically generates utility classes.

### Color Philosophy

- **Automatic theme switching**: CSS variables update based on `.dark` or `.light` class on `<html>`
- **No manual dark: variants**: Use CSS variable classes that adapt automatically
- **Semantic naming**: Colors named by purpose (primary, destructive) not appearance (red, gold)

---

**Touch Target Rules:**
- ✅ Minimum 44px height for all interactive elements
- ✅ Use `h-touch` class for buttons and interactive areas  
- ✅ Ensure adequate spacing between tap targets (min 8px)

---

## Component Patterns

### Mobile-First Approach

Always design mobile first, then enhance:

```tsx
// ✅ CORRECT - Mobile first
<div className="text-base sm:text-lg md:text-xl">
  Responsive text
</div>

<Button className="w-full sm:w-auto">
  Full width on mobile, auto on tablet+
</Button>

// ❌ WRONG - Desktop first (requires overrides)
<div className="text-xl md:text-base">Wrong</div>
```

### Common Responsive Patterns

```tsx
// Stack on mobile, grid on desktop
<div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
  <Card />
  <Card />
</div>

// Hide on mobile, show on tablet+
<span className="hidden sm:inline">Desktop only</span>

// Show on mobile, hide on tablet+
<span className="sm:hidden">Mobile only</span>

// Responsive padding
<div className="px-4 sm:px-6 md:px-8">Content</div>

// Responsive text sizing
<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
  Heading
</h1>
```

---

## Accessibility Guidelines

### Focus Management

- All interactive elements have visible `ring-[3px]` focus indicators
- Focus trap in modals and dialogs
- Logical tab order throughout
- Skip navigation links where appropriate

### Color Contrast

- **WCAG AA compliant** for all text
- Foreground: High contrast (`oklch(0.97 ...)` dark / `oklch(0.20 ...)` light)
- Muted foreground: Medium contrast (`oklch(0.66 ...)` / `oklch(0.50 ...)`)
- Test with color blindness simulators

### Motion & Animation

```tsx
// Respect prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Readers

```tsx
// Hidden but accessible
<span className="sr-only">Screen reader only text</span>

// Proper ARIA labels
<Button aria-label="Close dialog">
  <X className="w-4 h-4" />
</Button>

// Semantic HTML
<nav>...</nav>
<main>...</main>
<article>...</article>
```

---

## Best Practices

### Spacing Consistency

**✅ DO:**
- Use layout components (`PageContainer`, `Section`, `Stack`, `Grid`)
- Use spacing prop values (`xs`, `sm`, `md`, `lg`, `xl`)
- Let components handle responsive spacing

**❌ DON'T:**
- Use arbitrary spacing values (`mb-[23px]`)
- Mix layout component spacing with manual classes
- Use different spacing scales in different areas

### Color Usage

**✅ DO:**
- Use CSS variable classes (`bg-card`, `text-foreground`)
- Let theme switching happen automatically
- Use semantic color names (`destructive`, `success`)

**❌ DON'T:**
- Use `dark:` variants for theme colors
- Hardcode color values
- Use generic color names (`bg-red-500`)

### Component Composition

**✅ DO:**
- Compose small, focused components
- Use design system components
- Follow established patterns

**❌ DON'T:**
- Create one-off custom components
- Duplicate existing functionality
- Mix incompatible patterns

### Mobile-First Development

**✅ DO:**
- Start with mobile layout
- Use touch-friendly targets (44px minimum)
- Test on mobile first
- Progressive enhancement for desktop

**❌ DON'T:**
- Design desktop-first
- Use fixed pixel widths
- Make interactive elements too small
- Ignore mobile spacing needs
