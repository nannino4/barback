# Barback Frontend - Technology Stack Guide

This document defines the technology choices, architectural patterns, and high-level implementation strategies for the Barback frontend. For detailed coding standards and code examples, see [CodingGuidelines.md](./CodingGuidelines.md).

## Project Overview

**Barback** is an inventory management system for cocktail bars, targeting owners, managers, and staff in Rome/Italy. The application helps reduce waste, gain consumption insights, optimize ordering, and streamline inventory management.

**Frontend Type**: Single Page Application (SPA)  
**Target Users**: Bar owners, managers, bartenders  
**Key Features**: Auth, role-based access, inventory CRUD, real-time updates, notifications, analytics

## Core Technology Stack

### Build Tool & Framework
- **Vite**: Build tool using native ES modules for development, Rollup for production
- **React**: UI library with functional components and hooks
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
- **React Router**: Client-side routing
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

### Data Flow Architecture
1. **Server Data**: Components → TanStack Query hooks → API client → Backend
2. **Client Data**: Components → Zustand stores → Other components
3. **Forms**: React Hook Form → Zod validation → TanStack Query mutations

### Authentication Flow
1. Login/Register → JWT token → Zustand auth store + localStorage
2. API requests automatically include `Authorization: Bearer <token>`
3. Role-based component rendering and route protection
4. Automatic logout on 401 responses

### Component Architecture Patterns
- **Compound Components**: For complex UI (Dialog, DropdownMenu)
- **Custom Hooks**: For business logic reuse and API operations
- **Render Props**: For flexible component composition
- **Error Boundaries**: For graceful error handling

### State Management Strategy
- **Zustand (Client State)**: User data, UI state, app preferences, selected organization
- **TanStack Query (Server State)**: All API data, caching, background updates, optimistic updates
- **React Hook Form**: Local form state with Zod validation

## Role-Based Access Control

### User Roles
- **Owner**: Full access (all operations, subscription management)
- **Manager**: Management access (inventory, user invites, analytics)
- **Staff**: Basic access (inventory read/write only)

### Implementation Strategy
Role-based access is implemented through custom hooks that check user permissions and conditionally render components or enable/disable functionality. See [CodingGuidelines.md](./CodingGuidelines.md) for implementation examples.

## shadcn/ui Implementation Strategy

### Installation and Setup
shadcn/ui components are copied directly into the codebase rather than installed as npm dependencies. This provides full customization control.

**Key Commands:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button dialog card data-table form input select
```

### Usage Philosophy
Components are copied to `src/components/ui/` and become part of your codebase. They're styled with Tailwind CSS and fully customizable since they're not external dependencies.

## Implementation Guidelines

### Component Development
1. **Start with shadcn/ui components** when possible for consistency
2. **Create feature-specific components** in appropriate feature folders
3. **Use TypeScript interfaces** for all props and data structures
4. **Implement error boundaries** for robust error handling
5. **Add loading states** for all async operations

### API Integration Strategy
1. **Use TanStack Query** for all server state management
2. **Implement optimistic updates** for better user experience
3. **Handle loading and error states** consistently across the app
4. **Use proper cache invalidation** after mutations

### Styling Approach
1. **Use Tailwind utility classes** as the primary styling method
2. **Leverage shadcn/ui components** for consistent design system
3. **Create custom variants** by modifying shadcn/ui components
4. **Use CSS custom properties** for theming and dynamic styles

### Type Safety Strategy
1. **Define API response types** in `types/api.ts`
2. **Use Zod schemas** for runtime validation and type inference
3. **Infer types from Zod schemas** when possible to maintain single source of truth
4. **Avoid `any` types** - use proper typing with unknown or specific types

## Environment Configuration

### Required Environment Variables
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_NAME=Barback
```

## Performance Optimization Strategy

### Bundle Optimization
- **Code splitting** with React.lazy() for route-based chunks
- **Tree shaking** enabled by default with Vite
- **Image optimization** with proper formats and lazy loading
- **Chunk splitting** for vendor libraries to improve caching

### Runtime Performance
- **React.memo** for expensive component re-renders
- **useMemo/useCallback** for expensive calculations and stable references
- **TanStack Query caching** for efficient API data management
- **Virtualization** for large lists using react-window when needed

## Security Guidelines

### Authentication Security
- **JWT tokens** stored securely with appropriate expiration
- **Automatic token refresh** before expiration to maintain sessions
- **Secure cookie options** for sensitive data storage
- **CSRF protection** for state-changing operations

### Data Validation and Protection
- **Client-side validation** with Zod for user experience
- **Input sanitization** for XSS prevention
- **Role-based access control** enforced on all operations
- **API request validation** to ensure data integrity
