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

### Layout Components
**Use layout components for spacing and structure instead of custom div elements with Tailwind spacing classes.** The project provides reusable layout components (`Stack`, `Grid`, `PageContainer`, `Section`, `Divider`) that enforce consistent spacing and responsive behavior.

**Key principles:**
- **Prefer `Stack`** for vertical or horizontal spacing instead of `div` with `space-y-*` or `space-x-*`
- **Prefer `Grid`** for responsive grid layouts instead of custom `grid` classes
- **Use semantic components** (`PageContainer`, `Section`) for page structure
- **Avoid manual spacing** when a layout component exists for that purpose
- **Exception**: Complex flexbox layouts may still use `div` with flex classes when Stack is insufficient

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

## Loading UI Patterns

- **Meaningful text**: Always describe what is being loaded or processed (e.g., "Loading products", "Saving changes").

### Use Skeleton
Use skeleton placeholders that match the final layout and spacing.
- Loading lists/grids of items (cards, tables)  
- Initial page load with structured content  
- When the layout structure is known

Notes: skeletons communicate content shape and reduce layout shift. Prefer skeletons for perceived performance on content-heavy screens.

### Use Spinner
Use spinners for indeterminate or small, focused waits.
- Button actions (use `InlineSpinner` for inline/compact)  
- Indeterminate operations (OAuth redirects, external flows)  
- Small inline operations (icon/button level)  
- Full-page loading when layout is unknown (use `Spinner` with descriptive text)
- **Always** use `InlineSpinner` for buttons and compact spaces
- **Always** use `Spinner` with descriptive text for larger loading areas
- **Consistent sizing**: `sm` for inline, `md` for sections, `lg` for full-page

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

## Form Error Handling

### Declarative Error Display Pattern
**Always display form errors declaratively using mutation error state.** Never use imperative `onError` callbacks with toasts for form validation or API errors.

```typescript
// ❌ WRONG - Imperative error handling with toasts
const loginMutation = useMutation({
  mutationFn: authApi.login,
  onError: (error) => {
    toast.error(getLocalizedErrorMessage(error, t)); // Don't do this!
  }
});

// ✅ CORRECT - Declarative error handling
const loginMutation = useMutation({
  mutationFn: authApi.login,
  onSuccess: (response) => {
    // Success toasts and redirects are OK in onSuccess
    toast.success(t('auth.login.success'));
    navigate('/dashboard');
  }
  // No onError - let component handle errors declaratively
});

// In component JSX - display error state
{loginMutation.error && (
  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
    <p className="text-sm text-destructive">
      {isKnownError(loginMutation.error)
        ? getLocalizedErrorMessage(loginMutation.error, t)
        : t('errors.genericError')}
    </p>
  </div>
)}
```

### When to Use Each Pattern

**Declarative (Display in JSX)**: ✅ Recommended
- Form submission errors (login, register, password reset)
- Validation errors from backend
- Errors where user needs to read and understand
- Errors where user might retry with corrections

**Imperative (Toast/Alert)**: Use Sparingly
- Success confirmations
- Background operation failures (non-blocking)
- OAuth callback errors (when no form is visible)
- Session expiry notifications

### Error Handling Best Practices
1. **Expose error state** from custom hooks (e.g., `loginError`, `registerError`)
2. **Use `isKnownError` type guard** to check error types before displaying
3. **Always localize** error messages using `getLocalizedErrorMessage`
4. **Clear errors automatically** - TanStack Query clears errors on next mutation
5. **Show specific errors** - Use error codes to show precise messages (not generic)
6. **Make errors persistent** - Display in UI so user can read and understand
7. **Allow retrying** - Keep form state so user can fix and resubmit

## User Feedback

Use these channels (prefer local/contextual over global):

- **Inline validation**: `react-hook-form` + `zod` + `<FormMessage />` for field errors.
- **Form/page error blocks**: Declarative rendering using mutation/query error state; prefer `getLocalizedErrorMessage`.
- **Loading**: Skeletons for structured content; `Spinner`/`InlineSpinner` for indeterminate waits (with meaningful text).
- **Empty / error states**: Use `EmptyState` / `ErrorState` for lists/pages; include retry where possible.
- **Confirmation dialogs**: Use `ConfirmationDialog` for destructive or high-impact actions.
- **Toasts (snackbar)**: Use `notify.*` only for transient, non-blocking feedback (success confirmations, session expiry, background failures). Avoid toasts for form validation errors.

Implementation rules:

- Do not import `react-hot-toast` directly. Use `notify` from `src/lib/notify.ts`.
- Toast styling/positioning is centralized in `AppToaster`.

