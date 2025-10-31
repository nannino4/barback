# Barback Frontend - Coding Guidelines

This document defines the coding standards, formatting rules, naming conventions, and code example patterns for the Barback frontend project. All code examples in documentation and implementation should follow these guidelines.

## Code Formatting Standards

### Brace Style
Use Allman style braces (braces on their own line). Single-line blocks are allowed.

### Indentation & Spacing
- **Indentation**: Use 2 spaces for indentation
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

### Dark/Light Mode via CSS Variables
**All components automatically support both themes via CSS variables.** The design system uses OKLCH color variables that change based on the `.light` or `.dark` class on `<html>`.

```typescript
// ✅ CORRECT - CSS variables adapt automatically
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click me
  </Button>
</div>

// ❌ WRONG - Manual dark: overrides (unnecessary and breaks theme system)
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <Button className="bg-primary hover:bg-primary/90 dark:bg-primary/80">
    Click me
  </Button>
</div>
```

**Key principles:**
- **Use CSS variables**: `bg-background`, `text-foreground`, `border-border`, `text-primary`
- **Never use `dark:` variants** for colors defined in the theme (exceptions: animations, transforms)
- **Theme switches automatically**: CSS variables update when theme changes
- **Test both themes**: Verify appearance by toggling theme, not by adding `dark:` classes

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
    // Colors (CSS variables only - NO dark: variants)
    'bg-primary text-primary-foreground',
    // States (NO dark: variants)
    'hover:bg-primary/90 disabled:opacity-50',
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
                'p-4 border border-border rounded-lg',
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

## Focus State Patterns
- **Ring-only**: Use `focus-visible:ring-*` for focus indication, never change borders
- **Use color variables**: `ring-ring`, `ring-destructive`, `ring-success` (not manual opacity)
- **Component handles it**: Input and Button components already have focus states—don't override
- **No manual styling**: Never add `focus:border-*` or `focus-visible:border-*` to inputs/buttons
- **Consistent width**: Use `ring-[3px]` for all focus rings

```tsx
// ❌ WRONG - Manual focus styles, border change, manual opacity
<Input className="focus:border-ring focus:ring-2 focus:ring-ring/20" />

// ✅ CORRECT - Component handles focus automatically
<Input />

// ✅ CORRECT - Custom component using ring-only
<button className="focus-visible:ring-ring focus-visible:ring-[3px]">Click</button>
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

## Promise Handling
- **Use `void` operator** when intentionally ignoring promise return values
- **Never ignore promises** that might contain errors without explicit handling
- **Prefer `await` or `.catch()`** for promises where errors need handling
- **Common patterns**:
  - Navigation: `void navigate('/path')` - safe to ignore
  - Form submission: `void form.handleSubmit(fn)()` - errors handled in callbacks
  - Background tasks: `void someAsyncTask()` - fire and forget patterns

```typescript
// ✅ CORRECT - Intentionally ignoring promise with void
void navigate('/dashboard');
void form.handleSubmit(onSubmit)(e);

// ✅ CORRECT - Handling promise errors explicitly
try {
  await apiCall();
} catch (error) {
  handleError(error);
}

// ❌ WRONG - Floating promise without void or error handling
navigate('/dashboard'); // ESLint error
someAsyncTask(); // Potential unhandled rejection
```

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
