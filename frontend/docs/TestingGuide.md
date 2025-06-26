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
│   │   ├── auth/
│   │   │   └── __tests__/
│   │   └── inventory/
│   │       └── __tests__/
├── hooks/
│   └── __tests__/       # Custom hook tests
├── lib/
│   └── __tests__/       # Utility function tests
└── pages/
    └── __tests__/       # Page component tests
```

## Testing Patterns

### Component Testing - Input/Output Focus

**❌ Testing Implementation Details:**
```typescript
// DON'T: Testing internal state or implementation
test('ProductForm updates name state when input changes', () => {
  const { getByTestId } = render(<ProductForm />)
  const nameInput = getByTestId('name-input')
  
  fireEvent.change(nameInput, { target: { value: 'Vodka' } })
  
  // This tests implementation, not behavior
  expect(nameInput.value).toBe('Vodka')
})
```

**✅ Testing User Behavior:**
```typescript
// DO: Test what the user experiences
test('creates product when valid form is submitted', async () => {
  const mockOnSubmit = vi.fn()
  render(<ProductForm onSubmit={mockOnSubmit} />)
  
  // User actions
  await user.type(screen.getByLabelText(/product name/i), 'Grey Goose Vodka')
  await user.selectOptions(screen.getByLabelText(/category/i), 'spirits')
  await user.type(screen.getByLabelText(/par level/i), '5')
  await user.type(screen.getByLabelText(/current quantity/i), '3')
  await user.click(screen.getByRole('button', { name: /create product/i }))
  
  // Expected outcome
  expect(mockOnSubmit).toHaveBeenCalledWith({
    name: 'Grey Goose Vodka',
    category: 'spirits',
    parLevel: 5,
    currentQuantity: 3
  })
})

test('shows validation errors for invalid input', async () => {
  render(<ProductForm onSubmit={vi.fn()} />)
  
  // User submits empty form
  await user.click(screen.getByRole('button', { name: /create product/i }))
  
  // User sees error messages
  expect(screen.getByText(/product name is required/i)).toBeInTheDocument()
  expect(screen.getByText(/par level must be positive/i)).toBeInTheDocument()
})

test('disables submit button while creating product', async () => {
  const slowSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
  render(<ProductForm onSubmit={slowSubmit} />)
  
  // Fill valid form
  await user.type(screen.getByLabelText(/product name/i), 'Whiskey')
  await user.selectOptions(screen.getByLabelText(/category/i), 'spirits')
  await user.type(screen.getByLabelText(/par level/i), '10')
  await user.type(screen.getByLabelText(/current quantity/i), '8')
  
  const submitButton = screen.getByRole('button', { name: /create product/i })
  await user.click(submitButton)
  
  // Button shows loading state
  expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
})
```

### Custom Hook Testing

```typescript
// hooks/__tests__/useProducts.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProducts } from '../useProducts'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

test('returns products for organization', async () => {
  const { result } = renderHook(
    () => useProducts('org-123'),
    { wrapper: createWrapper() }
  )
  
  // Initially loading
  expect(result.current.isLoading).toBe(true)
  expect(result.current.data).toBeUndefined()
  
  // Wait for data
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })
  
  // Check output
  expect(result.current.data).toEqual([
    { id: '1', name: 'Vodka', category: 'spirits', quantity: 5 },
    { id: '2', name: 'Beer', category: 'beer', quantity: 12 }
  ])
})

test('handles API errors gracefully', async () => {
  // Mock API to return error
  server.use(
    rest.get('/api/organizations/org-123/products', (req, res, ctx) => {
      return res(ctx.status(500))
    })
  )
  
  const { result } = renderHook(
    () => useProducts('org-123'),
    { wrapper: createWrapper() }
  )
  
  await waitFor(() => {
    expect(result.current.isError).toBe(true)
  })
  
  expect(result.current.error).toBeTruthy()
  expect(result.current.data).toBeUndefined()
})
```

### API Client Testing

```typescript
// lib/__tests__/api.test.ts
import { api } from '../api'
import { server } from '../../__tests__/mocks/server'
import { rest } from 'msw'

test('creates product with correct data', async () => {
  const productData = {
    name: 'Test Vodka',
    category: 'spirits',
    parLevel: 10,
    currentQuantity: 5
  }
  
  const result = await api.products.create(productData)
  
  expect(result).toEqual({
    id: expect.any(String),
    ...productData,
    createdAt: expect.any(String)
  })
})

test('includes auth token in requests', async () => {
  let capturedHeaders: Record<string, string> = {}
  
  server.use(
    rest.get('/api/products', (req, res, ctx) => {
      capturedHeaders = Object.fromEntries(req.headers.entries())
      return res(ctx.json([]))
    })
  )
  
  // Set auth token
  localStorage.setItem('auth_token', 'test-token-123')
  
  await api.products.list('org-123')
  
  expect(capturedHeaders.authorization).toBe('Bearer test-token-123')
})

test('throws error for failed requests', async () => {
  server.use(
    rest.post('/api/products', (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({ error: 'Invalid data' }))
    })
  )
  
  await expect(api.products.create({})).rejects.toThrow('API Error: 400')
})
```

### Integration Testing - Feature Flows

```typescript
// features/inventory/__tests__/InventoryManagement.test.tsx
test('complete product management flow', async () => {
  render(<InventoryPage />, { wrapper: AppWrapper })
  
  // User sees existing products
  await waitFor(() => {
    expect(screen.getByText('Existing Vodka')).toBeInTheDocument()
  })
  
  // User adds new product
  await user.click(screen.getByRole('button', { name: /add product/i }))
  await user.type(screen.getByLabelText(/product name/i), 'New Whiskey')
  await user.selectOptions(screen.getByLabelText(/category/i), 'spirits')
  await user.type(screen.getByLabelText(/par level/i), '8')
  await user.type(screen.getByLabelText(/current quantity/i), '6')
  await user.click(screen.getByRole('button', { name: /create/i }))
  
  // User sees success message
  await waitFor(() => {
    expect(screen.getByText(/product created successfully/i)).toBeInTheDocument()
  })
  
  // New product appears in list
  expect(screen.getByText('New Whiskey')).toBeInTheDocument()
  
  // User edits the product
  await user.click(screen.getByRole('button', { name: /edit new whiskey/i }))
  await user.clear(screen.getByDisplayValue('6'))
  await user.type(screen.getByDisplayValue(''), '4')
  await user.click(screen.getByRole('button', { name: /save/i }))
  
  // Updated quantity is shown
  await waitFor(() => {
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})

test('role-based access control', async () => {
  // Login as staff user
  render(<InventoryPage />, { 
    wrapper: ({ children }) => (
      <AppWrapper initialAuth={{ user: staffUser }}>
        {children}
      </AppWrapper>
    )
  })
  
  // Staff can see products
  await waitFor(() => {
    expect(screen.getByText('Existing Vodka')).toBeInTheDocument()
  })
  
  // Staff cannot see admin actions
  expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /invite users/i })).not.toBeInTheDocument()
})
```

### E2E Testing - Critical User Journeys

```typescript
// e2e/inventory-management.spec.ts
import { test, expect } from '@playwright/test'

test('owner can manage complete inventory lifecycle', async ({ page }) => {
  // Login as owner
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'owner@bar.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('button:has-text("Login")')
  
  // Navigate to inventory
  await page.click('nav a:has-text("Inventory")')
  await expect(page.locator('h1')).toHaveText('Inventory Management')
  
  // Add new product
  await page.click('button:has-text("Add Product")')
  await page.fill('[data-testid="product-name"]', 'Premium Gin')
  await page.selectOption('[data-testid="category"]', 'spirits')
  await page.fill('[data-testid="par-level"]', '12')
  await page.fill('[data-testid="current-quantity"]', '8')
  await page.click('button:has-text("Create Product")')
  
  // Verify product was created
  await expect(page.locator('text=Premium Gin')).toBeVisible()
  await expect(page.locator('text=Product created successfully')).toBeVisible()
  
  // Adjust stock
  await page.click('[data-testid="product-actions-premium-gin"]')
  await page.click('text=Adjust Stock')
  await page.fill('[data-testid="adjustment-quantity"]', '+5')
  await page.selectOption('[data-testid="reason"]', 'delivery')
  await page.click('button:has-text("Apply Adjustment")')
  
  // Verify stock was adjusted
  await expect(page.locator('text=13')).toBeVisible() // 8 + 5
  
  // Generate report
  await page.click('button:has-text("Generate Report")')
  await page.selectOption('[data-testid="report-period"]', 'last-week')
  await page.click('button:has-text("Generate")')
  
  // Verify report shows data
  await expect(page.locator('[data-testid="report-table"]')).toBeVisible()
  await expect(page.locator('text=Premium Gin')).toBeVisible()
})

test('low stock alerts work correctly', async ({ page }) => {
  // Set up product with low stock
  await setupProductWithLowStock(page)
  
  await page.goto('/dashboard')
  
  // Should see low stock alert
  await expect(page.locator('[data-testid="low-stock-alert"]')).toBeVisible()
  await expect(page.locator('text=Premium Gin is below par level')).toBeVisible()
  
  // Click to reorder
  await page.click('button:has-text("Reorder")')
  
  // Should navigate to reorder page
  await expect(page).toHaveURL(/.*\/reorder/)
})
```

## MSW API Mocking

### Setup
```typescript
// __tests__/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  // Products API
  rest.get('/api/organizations/:orgId/products', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'Existing Vodka',
          category: 'spirits',
          parLevel: 10,
          currentQuantity: 7,
          cost: 25.50
        },
        {
          id: '2', 
          name: 'Craft Beer',
          category: 'beer',
          parLevel: 24,
          currentQuantity: 18,
          cost: 4.50
        }
      ])
    )
  }),
  
  rest.post('/api/products', async (req, res, ctx) => {
    const product = await req.json()
    return res(
      ctx.json({
        id: Date.now().toString(),
        ...product,
        createdAt: new Date().toISOString()
      })
    )
  }),
  
  // Auth API
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json()
    
    if (email === 'owner@bar.com' && password === 'password123') {
      return res(
        ctx.json({
          user: {
            id: '1',
            email: 'owner@bar.com',
            role: 'owner',
            organizations: [{ id: 'org-1', name: 'Test Bar' }]
          },
          token: 'mock-jwt-token'
        })
      )
    }
    
    return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }))
  })
]

// __tests__/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

## Test Configuration

### Vitest Setup
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        'src/main.tsx'
      ]
    }
  }
})

// src/__tests__/setup.ts
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Start MSW server
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))
```

### Custom Render Utilities
```typescript
// __tests__/utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

interface CustomRenderOptions extends RenderOptions {
  initialAuth?: { user: User | null; token?: string }
}

const AllTheProviders = ({ 
  children, 
  initialAuth 
}: { 
  children: React.ReactNode 
  initialAuth?: { user: User | null; token?: string }
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider initialState={initialAuth}>
          {children}
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
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
