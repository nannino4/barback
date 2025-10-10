# Barback Frontend - Coding Guidelines

This document defines the coding standards, formatting rules, naming conventions, and code example patterns for the Barback frontend project. All code examples in documentation and implementation should follow these guidelines.

## Code Formatting Standards

### Brace Style
Use Allman style braces (braces on their own line). Single-line blocks are allowed.

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

## Import Patterns

### Consistent Import Strategy
**Always use `@` alias for internal imports** for consistency and maintainability:

### Import Organization
Organize imports in this order:
1. **External libraries** (React, third-party packages)
2. **Internal modules** (using `@/` alias)
3. **Type imports** (grouped at the end with `type` keyword)

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

### Dark/Light Mode Requirement
**All components must support both light and dark modes.** Use Tailwind's `dark:` variant for dark mode styles.

```typescript
// ✅ CORRECT - Both modes styled
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
    Click me
  </Button>
</div>

// ❌ WRONG - Only light mode
<div className="bg-white text-gray-900">
  <Button className="bg-blue-600 hover:bg-blue-700">
    Click me
  </Button>
</div>
```

**Key principles:**
- Define colors for both modes: background, text, borders, hover states
- Use semantic color variables when available (e.g., `bg-background`, `text-foreground`)
- Test components in both themes during development

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
    // Colors (include dark mode)
    'bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100',
    // States (include dark mode)
    'hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50',
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

## Loading State Patterns
- **Always** use `InlineSpinner` for buttons and compact spaces
- **Always** use `Spinner` with descriptive text for larger loading areas
- **Consistent sizing**: `sm` for inline, `md` for sections, `lg` for full-page
- **Meaningful text**: Describe what's being loaded or processed

## Navigation Patterns
- **Internal Routes**: Always use `useNavigate()` hook from React Router
- **External URLs**: Use `window.location.href` for full page redirects
- **OAuth Flows**: Use `window.location.href` to redirect to OAuth providers
- **Replace vs Push**: Use `{ replace: true }` when you don't want the user to go back

## Internationalization (i18n)

### Mandatory Localization
**All user-facing text must use the localization system.** Never use hardcoded strings.

```typescript
// ❌ WRONG - Hardcoded text
<button>Sign In</button>
<p>Welcome back!</p>

// ✅ CORRECT - Using translation keys
const { t } = useI18n();

<button>{t('auth.login.signIn')}</button>
<p>{t('auth.login.welcomeBack')}</p>
```

### Key Requirements
- **Always import** `useI18n` hook in components with text
- **Organize keys** by feature in translation files (eg: `auth.*`, `inventory.*`)
- **Add both languages**: Update English and Italian translation files simultaneously
- **Use descriptive keys**: `auth.login.emailPlaceholder` not `login.email`
