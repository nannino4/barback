# Barback Frontend - Technology Stack Guide

This document defines the technology stack, architectural patterns, and implementation guidelines.

## Project Overview

**Barback** is an inventory management system for cocktail bars, targeting owners, managers, and staff in Rome/Italy. The application helps reduce waste, gain consumption insights, optimize ordering, and streamline inventory management.

**Frontend Type**: Single Page Application (SPA)  
**Target Users**: Bar owners, managers, bartenders  
**Key Features**: Auth, role-based access, inventory CRUD, real-time updates, notifications, analytics

## Core Technology Stack

### Build Tool & Framework
- **Vite**: Build tool using native ES modules for development, Rollup for production
- **React 18**: UI library with functional components and hooks
- **TypeScript**: Full type safety across the application
- **Target**: Modern browsers with ES2020+ support

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Copy-paste component system (NOT an npm dependency)
- **Radix UI Primitives**: Accessible, unstyled component primitives
- **Lucide React**: Icon library

### State Management
- **Client State**: Zustand for app-wide state (user, UI preferences, selected organization)
- **Server State**: TanStack Query (React Query) for API data, caching, background updates
- **Form State**: React Hook Form for performant form handling

### Validation & Forms
- **Zod**: TypeScript-first schema validation
- **React Hook Form**: Form library with minimal re-renders
- **@hookform/resolvers/zod**: Integration between RHF and Zod

### HTTP & API
- **Fetch API**: Native browser HTTP client
- **TanStack Query**: Wraps fetch with advanced caching and synchronization
- **Custom API Client**: Centralized request handling with auth token injection

### Routing & Navigation
- **React Router v6**: Client-side routing
- **Protected Routes**: Role-based route protection

### Notifications & UX
- **React Hot Toast**: Lightweight toast notifications
- **Loading States**: Built into TanStack Query
- **Error Boundaries**: React error handling

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Dialog, Card, etc.)
│   ├── features/        # Feature-specific components
│   │   ├── auth/        # Login, Register, UserProfile
│   │   ├── inventory/   # ProductList, ProductForm, StockAdjustment
│   │   ├── organization/# OrgSettings, UserInvites, MembersList
│   │   └── analytics/   # Charts, Reports, Dashboard
│   └── layout/          # Header, Sidebar, AppShell
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication logic
│   ├── useProducts.ts   # Product API operations
│   └── useOrganization.ts
├── stores/              # Zustand stores
│   ├── authStore.ts     # User authentication state
│   └── appStore.ts      # App-wide UI state
├── lib/
│   ├── api.ts           # API client and endpoints
│   ├── auth.ts          # Auth utilities
│   ├── utils.ts         # General utilities (cn, formatters)
│   └── validations.ts   # Zod schemas
├── pages/               # Route components
│   ├── auth/            # Login, Register, ForgotPassword
│   ├── dashboard/       # Main dashboard
│   ├── inventory/       # Inventory management
│   └── settings/        # User and org settings
└── types/               # TypeScript type definitions
    ├── api.ts           # API response types
    ├── auth.ts          # User and auth types
    └── inventory.ts     # Product and inventory types
```

## Key Architectural Patterns

### Data Flow
1. **Server Data**: Components → TanStack Query hooks → API client → Backend
2. **Client Data**: Components → Zustand stores → Other components
3. **Forms**: React Hook Form → Zod validation → TanStack Query mutations

### Authentication Flow
1. Login/Register → JWT token → Zustand auth store + localStorage
2. API requests automatically include `Authorization: Bearer <token>`
3. Role-based component rendering and route protection
4. Automatic logout on 401 responses

### Component Patterns
- **Compound Components**: For complex UI (Dialog, DropdownMenu)
- **Custom Hooks**: For business logic reuse
- **Render Props**: For flexible component composition
- **Error Boundaries**: For graceful error handling

## Role-Based Access Control

### User Roles
- **Owner**: Full access (all operations, subscription management)
- **Manager**: Management access (inventory, user invites, analytics)
- **Staff**: Basic access (inventory read/write only)

### Implementation Pattern
```typescript
const useAuth = () => {
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }
  
  return { user, hasRole }
}
```

## shadcn/ui Implementation

### Installation Commands
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button dialog card data-table form input select
```

### Usage Pattern
```typescript
// Components are copied to src/components/ui/
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"

// Fully customizable since they're in your codebase
// Styled with Tailwind CSS classes
```

## State Management Guidelines

### Zustand (Client State)
**Use For**: User data, UI state, app preferences, selected organization
```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials) => Promise<void>
  logout: () => void
}

const useAuthStore = create<AuthState>()(persist(/* ... */))
```

### TanStack Query (Server State)
**Use For**: All API data, caching, background updates, optimistic updates
```typescript
const useProducts = (orgId: string) => {
  return useQuery({
    queryKey: ['products', orgId],
    queryFn: () => api.products.list(orgId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds for real-time updates
  })
}
```

## Form Handling Pattern

### Standard Form Implementation
```typescript
const productSchema = z.object({
  name: z.string().min(1, 'Name required'),
  category: z.enum(['spirits', 'beer', 'wine', 'mixers']),
  parLevel: z.number().min(0),
  currentQuantity: z.number().min(0),
})

type ProductFormData = z.infer<typeof productSchema>

const ProductForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema)
  })
  
  const createProductMutation = useMutation({
    mutationFn: api.products.create,
    onSuccess: () => toast.success('Product created successfully')
  })
  
  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* ... */}
    </form>
  )
}
```

## API Client Pattern

### Centralized API Client
```typescript
// lib/api.ts
const api = {
  request: async <T>(url: string, options?: RequestInit): Promise<T> => {
    const token = useAuthStore.getState().token
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    })
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    return response.json()
  },
  
  products: {
    list: (orgId: string) => api.request<Product[]>(`/organizations/${orgId}/products`),
    create: (product: NewProduct) => api.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),
    update: (id: string, updates: Partial<Product>) => 
      api.request<Product>(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
  }
}
```

## Environment Configuration

### Required Environment Variables
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_NAME=Barback
```

## Development Guidelines

### Component Creation
1. **Start with shadcn/ui components** when possible
2. **Create feature-specific components** in appropriate feature folders
3. **Use TypeScript interfaces** for all props
4. **Implement error boundaries** for robust error handling
5. **Add loading states** for all async operations

### API Integration
1. **Use TanStack Query** for all server state
2. **Implement optimistic updates** for better UX
3. **Handle loading and error states** consistently
4. **Use proper cache invalidation** after mutations

### Styling Guidelines
1. **Use Tailwind utility classes** primarily
2. **Leverage shadcn/ui components** for consistent design
3. **Create custom variants** by modifying shadcn/ui components
4. **Use CSS custom properties** for theming

### Type Safety
1. **Define API response types** in `types/api.ts`
2. **Use Zod schemas** for runtime validation
3. **Infer types from Zod schemas** when possible
4. **Avoid `any` types** - use proper typing

## Performance Considerations

### Bundle Optimization
- **Code splitting** with React.lazy()
- **Tree shaking** enabled by default with Vite
- **Image optimization** with proper formats and lazy loading
- **Chunk splitting** for vendor libraries

### Runtime Performance
- **React.memo** for expensive component re-renders
- **useMemo/useCallback** for expensive calculations
- **TanStack Query caching** for API data
- **Virtualization** for large lists (react-window)

## Security Guidelines

### Authentication Security
- **JWT tokens** stored securely
- **Automatic token refresh** before expiration
- **Secure cookie options** for sensitive data
- **CSRF protection** for state-changing operations

### Data Validation
- **Client-side validation** with Zod (UX)
- **Input sanitization** for XSS prevention
- **Role-based access control** on all operations

## Deployment Configuration

### Build Configuration
```json
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

### Environment-Specific Settings
- **Development**: Hot reload, source maps, detailed errors
- **Production**: Minification, compression, error tracking
- **Staging**: Production-like with debugging enabled

## Common Patterns & Examples

### Protected Route Implementation
```typescript
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole } = useAuth()
  
  if (!isAuthenticated) return <Navigate to="/login" />
  if (requiredRole && !hasRole(requiredRole)) {
    return <div>Access denied</div>
  }
  return <>{children}</>
}

// Usage examples
<ProtectedRoute requiredRole="owner">
  <SubscriptionSettings />
</ProtectedRoute>

<ProtectedRoute requiredRole={['owner', 'manager']}>
  <UserInvitePanel />
</ProtectedRoute>
```

### Data Table with Actions
```typescript
const InventoryTable = () => {
  const { data: products } = useProducts(orgId)
  const deleteProductMutation = useMutation({
    mutationFn: api.products.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Product deleted')
    }
  })
  
  const columns = [
    { accessorKey: 'name', header: 'Product Name' },
    { accessorKey: 'quantity', header: 'Stock' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">⋯</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editProduct(row.original.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => deleteProductMutation.mutate(row.original.id)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]
  
  return <DataTable columns={columns} data={products || []} />
}
```

### Real-time Updates Pattern
```typescript
const useRealtimeProducts = (orgId: string) => {
  return useQuery({
    queryKey: ['products', orgId],
    queryFn: () => api.products.list(orgId),
    refetchInterval: 30000, // 30 seconds
    staleTime: 25000, // Consider stale after 25 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
```

## Troubleshooting Common Issues

### Build Issues
- **Import path errors**: Use `@/` alias for src imports
- **TypeScript errors**: Ensure proper type definitions
- **Tailwind not working**: Check postcss.config.js setup

### Runtime Issues
- **Auth token expiry**: Implement automatic refresh
- **Query cache stale**: Use proper invalidation strategies
- **Form validation**: Ensure Zod schemas match API expectations

This documentation should serve as a comprehensive guide for AI agents to understand the Barback frontend architecture and implementation patterns.
