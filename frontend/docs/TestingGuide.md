# Barback Frontend - Testing Guide

This is the frontend-specific testing reference. Monorepo-level testing strategy
lives in `../../docs/testing.md`.

This document outlines the testing strategy and implementation patterns for the Barback frontend application, focusing on input/output behavior rather than implementation details.

## Testing Philosophy

### Input/Output Focused Testing
We focus on testing **what the component does**, not **how it does it**. This approach:
- Makes tests more resilient to refactoring
- Tests behavior that users actually experience  
- Reduces test maintenance overhead
- Catches real bugs that affect user experience

### Testing Pyramid
```
    /\     E2E Tests (Few)
   /  \    - Critical user journeys
  /____\   - Real browser, real API
 /      \  
/  Unit  \ Integration Tests (Some)
\  Tests / - Component behavior
 \______/  - Custom hooks
          - API client functions
          
          Unit Tests (Many)
          - Pure functions
          - Utilities
          - Validation schemas
```

## Technology Stack

### Testing Tools
- **Vitest**: Fast unit testing (Vite-native, compatible with Jest)
- **React Testing Library**: Component testing focused on user behavior
- **Playwright**: Mandatory browser automation for E2E smoke tests, responsive checks, visual inspection, and UI experimentation feedback
- **@testing-library/user-event**: Realistic user interactions

MSW can be added later if API-heavy component tests need realistic network-level
mocks. Do not document MSW as required unless it is installed and used by the
suite.

### Testing Utilities
- **@testing-library/jest-dom**: Custom matchers for DOM testing
- **@testing-library/user-event**: Realistic user interactions in component tests
- **Vitest coverage**: Coverage reporting when enabled through Vitest configuration

## Project Structure

```
src/
├── test/                # Vitest setup and utilities
├── components/
│   ├── ui/
│   │   └── __tests__/   # shadcn/ui component tests
│   ├── features/
│   │   ├── feature/
│   │   │   └── __tests__/
├── hooks/
│   └── __tests__/       # Custom hook tests
├── lib/
│   └── __tests__/       # Utility function tests
└── pages/
    └── __tests__/       # Page component tests

e2e/                     # Playwright browser tests
```

## Best Practices

### What to Test
✅ **User interactions and their outcomes**
✅ **Component props → rendered output**
✅ **Form submissions and validation**
✅ **Error states and loading states** 
✅ **Role-based access control**
✅ **API integration behavior**

### What NOT to Test
❌ **Internal component state**
❌ **Implementation details (how component works internally)**
❌ **Third-party library behavior (React Query, shadcn/ui)**
❌ **CSS styling (unless it affects functionality)**
❌ **Mock implementations**

### Naming Conventions
```typescript
// Describe behavior, not implementation
test('shows error when product name is empty')           // ✅ Good
test('validates productName field')                      // ❌ Vague

test('submits form with user input')                     // ✅ Good  
test('calls handleSubmit when form is submitted')       // ❌ Implementation

test('displays products for selected organization')      // ✅ Good
test('useProducts hook returns data')                   // ❌ Implementation
```

### Test Organization
- **Group related tests** with `describe` blocks
- **Use descriptive test names** that explain the scenario
- **Keep tests focused** - one behavior per test
- **Use setup/teardown** appropriately
- **Don't repeat yourself** - extract common setup

## Playwright Browser Testing

Playwright is part of the required frontend validation workflow. After a fresh
checkout or Playwright version update, install the browser binary once:

```bash
npx playwright install chromium
```

Then run:

```bash
npm run test:e2e
```

The Playwright config starts the Vite dev server unless
`PLAYWRIGHT_SKIP_WEB_SERVER=true` is set. The default base URL is:

```text
http://localhost:5173
```

Set `PLAYWRIGHT_BASE_URL` when checking a different running environment.

Use Playwright for:

- public-route and auth-route smoke tests;
- mobile/tablet/desktop responsive checks;
- horizontal overflow checks;
- critical navigation and form flows;
- visual inspection during UI experimentation.

For repeatable screenshots during design work:

```bash
npm run screenshots
```

Generated screenshots live in `docs/screenshots/` and are gitignored. They are
working artifacts, not deliverables.

For UI experiments, follow `frontend/docs/UIExperimentationGuide.md`: define the
single variable, build comparable variants, inspect them in the browser, present
an opinionated read, port the winner, and remove temporary experiment code.

This testing approach ensures your Barback application is robust, maintainable,
and provides confidence that features work as users expect them to.
