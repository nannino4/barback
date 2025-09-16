# Barback Frontend - Testing Guide

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
- **MSW (Mock Service Worker)**: API mocking for realistic network requests
- **Playwright**: E2E testing in real browsers
- **@testing-library/user-event**: Realistic user interactions

### Testing Utilities
- **@testing-library/jest-dom**: Custom matchers for DOM testing
- **@vitest/ui**: Visual test runner interface
- **c8**: Code coverage reporting

## Project Structure

```
src/
├── __tests__/           # Global test setup and utilities
│   ├── setup.ts         # Test environment configuration
│   ├── mocks/           # MSW API mocks
│   └── utils.tsx        # Custom render functions
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

This testing approach ensures your Barback application is robust, maintainable, and provides confidence that features work as users expect them to.
