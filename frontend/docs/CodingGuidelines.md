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

```typescript
// Correct formatting
const config = {
    apiUrl: 'http://localhost:8000',
    timeout: 5000,
    retries: 3,
}

const handleSubmit = (
    data: FormData,
    options: SubmitOptions,
    callback: () => void,
) => {
    // implementation
}
```

## TypeScript Standards

### Type Safety Rules
- **Strict Mode**: Always enabled (`strict: true`)
- **No `any`**: Avoid `any` type; use proper typing
- **Explicit Types**: Define types when inference isn't clear
- **Null/Undefined Handling**: Explicit handling required

```typescript
// Correct - Explicit types and null handling
interface User {
    id: string;
    name: string;
    email: string | null;
}

const getUserEmail = (user: User): string => {
    if (user.email === null)
    {
        throw new Error('User email is required');
    }
    return user.email;
}

// Incorrect - Implicit any and no null handling
const getUserEmail = (user) => {
    return user.email; // Could be null
}
```

### Interface and Type Definitions
```typescript
// Use interfaces for object shapes
interface ProductFormData {
    name: string;
    category: ProductCategory;
    parLevel: number;
    currentQuantity: number;
}

// Use type aliases for unions and computed types
type UserRole = 'owner' | 'manager' | 'staff';
type ApiResponse<T> = {
    data: T;
    message: string;
    success: boolean;
};
```

## Component Patterns

### Function Component Structure
```typescript
interface ComponentProps {
    title: string;
    onSubmit: (data: FormData) => void;
    isLoading?: boolean;
}

const ExampleComponent: React.FC<ComponentProps> = ({
    title,
    onSubmit,
    isLoading = false,
}) => {
    const [localState, setLocalState] = useState<string>('');
    
    const handleClick = useCallback(() => {
        // Handle click logic
    }, []);
    
    if (isLoading)
    {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="p-4">
            <h1>{title}</h1>
            {/* Component content */}
        </div>
    );
};
```

### Custom Hook Patterns
```typescript
interface UseApiResult<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

const useProducts = (orgId: string): UseApiResult<Product[]> => {
    return useQuery({
        queryKey: ['products', orgId],
        queryFn: () => api.products.list(orgId),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000,
    });
};
```

## State Management Patterns

### Zustand Store Structure
```typescript
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            
            login: async (credentials) => {
                try
                {
                    const response = await api.auth.login(credentials);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                    });
                }
                catch (error)
                {
                    throw new Error('Login failed');
                }
            },
            
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },
            
            refreshToken: async () => {
                // Implementation
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),
        },
    ),
);
```

## Form Handling Patterns

### React Hook Form with Zod
```typescript
const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.enum(['spirits', 'beer', 'wine', 'mixers']),
    parLevel: z.number().min(0, 'Par level must be positive'),
    currentQuantity: z.number().min(0, 'Quantity must be positive'),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            category: 'spirits',
            parLevel: 0,
            currentQuantity: 0,
        },
    });
    
    const createProductMutation = useMutation({
        mutationFn: api.products.create,
        onSuccess: () => {
            toast.success('Product created successfully');
            reset();
        },
        onError: () => {
            toast.error('Failed to create product');
        },
    });
    
    const onSubmit = (data: ProductFormData) => {
        createProductMutation.mutate(data);
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                    id="name"
                    {...register('name')}
                    disabled={isSubmitting}
                />
                {errors.name && (
                    <span className="text-red-500 text-sm">
                        {errors.name.message}
                    </span>
                )}
            </div>
            
            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
        </form>
    );
};
```

## API Client Patterns

### Centralized API Client
```typescript
class ApiClient {
    private baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }
    
    private async request<T>(
        endpoint: string,
        options?: RequestInit,
    ): Promise<T> {
        const token = useAuthStore.getState().token;
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options?.headers,
            },
            ...options,
        });
        
        if (!response.ok)
        {
            throw new ApiError(response.status, response.statusText);
        }
        
        return response.json();
    }
    
    public products = {
        list: (orgId: string): Promise<Product[]> =>
            this.request(`/organizations/${orgId}/products`),
        
        create: (product: CreateProductRequest): Promise<Product> =>
            this.request('/products', {
                method: 'POST',
                body: JSON.stringify(product),
            }),
        
        update: (id: string, updates: UpdateProductRequest): Promise<Product> =>
            this.request(`/products/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            }),
        
        delete: (id: string): Promise<void> =>
            this.request(`/products/${id}`, { method: 'DELETE' }),
    };
}

const api = new ApiClient(import.meta.env.VITE_API_BASE_URL);
```

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

## Performance Optimization Patterns

### Memoization
```typescript
const ExpensiveComponent: React.FC<Props> = ({ data, onUpdate }) => {
    const processedData = useMemo(() => {
        return data.map((item) => ({
            ...item,
            computedValue: expensiveCalculation(item),
        }));
    }, [data]);
    
    const handleUpdate = useCallback(
        (id: string, updates: Partial<Item>) => {
            onUpdate(id, updates);
        },
        [onUpdate],
    );
    
    return (
        <div>
            {processedData.map((item) => (
                <ItemComponent
                    key={item.id}
                    item={item}
                    onUpdate={handleUpdate}
                />
            ))}
        </div>
    );
};
```

## Code Documentation Standards

### JSDoc Comments
```typescript
/**
 * Calculates the total value of inventory items
 * @param items - Array of inventory items
 * @param includeReserved - Whether to include reserved items in calculation
 * @returns The total monetary value of all items
 * @throws {ValidationError} When items array is empty
 * @example
 * ```typescript
 * const total = calculateInventoryValue(products, true);
 * console.log(`Total value: $${total}`);
 * ```
 */
const calculateInventoryValue = (
    items: InventoryItem[],
    includeReserved: boolean = false,
): number => {
    if (items.length === 0)
    {
        throw new ValidationError('items', 'Items array cannot be empty');
    }
    
    return items
        .filter((item) => includeReserved || !item.isReserved)
        .reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
};
```

This coding guidelines document ensures consistency across the Barback frontend codebase and serves as a reference for all code examples used in documentation.
