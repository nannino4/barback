# Barback Frontend - Coding Guidelines

This document defines the coding standards, formatting rules, naming conventions, and code example patterns for the Barback frontend project. All code examples in documentation and implementation should follow these guidelines.

## Code Formatting Standards

### Brace Style
Use Allman style braces (braces on their own line). Single-line blocks are allowed.

```typescript
// Correct - Multi-line
if (condition)
{
    // code
}
else
{
    // code
}

// Also correct - Single line
if (condition) { /* code */ }
```

### Indentation & Spacing
- **Indentation**: Use 4 spaces for indentation
- **No Tabs**: Use spaces instead of tabs
- **Line Length**: Maximum 80 columns when possible
- **Trailing Commas**: Use trailing commas for multiline structures

## TypeScript Standards

### Type Safety Rules
- **Strict Mode**: Always enabled (`strict: true`)
- **No `any`**: Avoid `any` type; use proper typing
- **Explicit Types**: Define types when inference isn't clear
- **Null/Undefined Handling**: Explicit handling required

## Error Handling Patterns

### Error Boundary Implementation
```typescript
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<
    React.PropsWithChildren<{}>,
    ErrorBoundaryState
> {
    constructor(props: React.PropsWithChildren<{}>) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error boundary caught an error:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError)
        {
            return (
                <div className="p-4 text-center">
                    <h2 className="text-lg font-semibold text-red-600">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                </div>
            );
        }
        
        return this.props.children;
    }
}
```

### Custom Error Classes
```typescript
class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        message?: string,
    ) {
        super(message || `API Error: ${status} ${statusText}`);
        this.name = 'ApiError';
    }
}

class ValidationError extends Error {
    constructor(
        public field: string,
        message: string,
    ) {
        super(`Validation error for ${field}: ${message}`);
        this.name = 'ValidationError';
    }
}
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (`ProductForm.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase starting with 'use' (`useAuth.ts`, `useProducts.ts`)
- **Utilities**: camelCase (`formatCurrency.ts`, `validateEmail.ts`)
- **Types**: camelCase (`userTypes.ts`, `apiTypes.ts`)
- **Constants**: camelCase (`apiEndpoints.ts`, `appConfig.ts`)

### Variables and Functions
```typescript
// Constants - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'http://localhost:8000';
const MAX_RETRY_ATTEMPTS = 3;

// Variables and functions - camelCase
const currentUser = useAuthStore((state) => state.user);
const isAuthenticated = !!currentUser;

const handleSubmitForm = (data: FormData) => {
    // Implementation
};

// Component props interfaces - PascalCase with Props suffix
interface ProductFormProps {
    onSubmit: (data: ProductFormData) => void;
    initialData?: Product;
}

// Type aliases - PascalCase
type UserRole = 'owner' | 'manager' | 'staff';
type ApiResponse<T> = {
    data: T;
    success: boolean;
    message: string;
};
```

## CSS and Styling Conventions

### Tailwind Class Organization
```typescript
// Order: Layout → Spacing → Typography → Colors → States
const buttonClasses = cn(
    // Layout
    'flex items-center justify-center',
    // Spacing
    'px-4 py-2',
    // Typography
    'text-sm font-medium',
    // Colors
    'bg-blue-600 text-white',
    // States
    'hover:bg-blue-700 disabled:opacity-50',
    // Custom classes
    className,
);
```

### Component Styling Patterns
```typescript
const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
    return (
        <Card
            className={cn(
                'p-4 border border-gray-200 rounded-lg',
                'hover:shadow-md transition-shadow',
                className,
            )}
        >
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                    {product.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Content */}
            </CardContent>
        </Card>
    );
};
```
