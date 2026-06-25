---
name: barback-ui-ux
description: UI/UX and visual validation workflow for Barback. Use when changing frontend layout, styling, components, responsive behavior, loading/empty/error states, forms, dialogs, sheets, navigation, or user-facing copy.
---

# Barback UI/UX

Use this with `barback-frontend-development` for UI changes.

## Design principles

- Mobile-first; optimize for bar environments and fast touch interactions.
- Minimum 44px touch targets for interactive elements.
- Inventory is the default workspace; avoid bringing back dashboard-centric IA.
- Keep high-frequency actions within 1-2 taps.
- Role-aware UX: Owner/Manager get admin affordances; Staff gets focused daily
  inventory actions.

## Styling rules

- Use OKLCH CSS-variable theme classes: `bg-background`, `text-foreground`,
  `border-border`, `bg-card`, etc.
- Never use `dark:` variants for theme colors.
- Prefer layout components (`Stack`, `Grid`, `PageContainer`, `Section`) over
  ad-hoc spacing divs.
- Use existing `components/ui` and feature components before writing custom
  markup.
- Focus indicators are ring-only; do not change borders on focus.

## Loading and feedback

- Skeletons for structured content where the final layout is known.
- `Spinner` with descriptive text for larger unknown waits.
- `InlineSpinner` for buttons/compact spaces.
- Use `EmptyState` / `ErrorState` for lists/pages where possible.
- Use confirmation dialogs for destructive/high-impact actions.
- Use toasts only for transient feedback, not form validation errors.

## Experiment workflow

When a design choice is subjective:

1. Define the single variable under test.
2. Build 2-4 comparable variants using real components/tokens/data.
3. Inspect mobile and desktop in Playwright/browser tooling.
4. Check light and dark themes when colors are involved.
5. Present screenshots/live routes plus a short, opinionated recommendation.
6. Port only the selected variant into production code.
7. Remove temporary experiment code.

## Mandatory visual validation

For every UI change, perform visual validation before the final response using
Playwright/browser tooling. At minimum, inspect the changed route/component in a
relevant mobile and desktop viewport; also inspect light and dark themes when
colors, theme tokens, dialogs, overlays, or visual states are touched.

```bash
cd frontend
npm run test:e2e
npm run screenshots
```

The final response must include what was visually inspected (route/component,
viewport, theme, and tool used). If tooling is unavailable or blocked, state that
explicitly with the reason instead of implying validation was completed.

Reference docs:

- `frontend/docs/design-system.md`
- `frontend/docs/ux.md`
- `frontend/docs/UIExperimentationGuide.md`
- `frontend/docs/CodingGuidelines.md`
