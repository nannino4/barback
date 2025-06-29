# Email/Password Authentication

## Feature Overview

Email/password authentication provides the primary authentication method for Barback users, supporting registration, login, and role-based access control. This is the core authentication method for bar owners, managers, and staff.

## User Experience Flows

### Registration Flow

#### New User Registration Journey
```
1. User Discovery
   ↓
2. Landing/Marketing Page → "Get Started" CTA
   ↓
3. Registration Page (/auth/register)
   ├── Email/Password Form
   ├── Personal Info (First/Last Name)
   ├── Optional Phone Number (Italian format)
   └── Google OAuth Alternative
   ↓
4. Form Submission & Validation
   ├── Real-time field validation
   ├── Password strength checking
   └── Email uniqueness verification
   ↓
5. Account Creation Success
   ↓
6. Email Verification Required Page (/auth/verify-email)
   ├── Verification instructions
   ├── Resend email option
   └── Change email option
   ↓
7. Email Verification (via email link)
   ↓
8. Verification Success → Auto-redirect to Dashboard
   ↓
9. Organization Setup Flow (if no existing invitations)
```

#### Registration Form Interaction Flow
```
Field Entry Sequence:
1. First Name → Auto-advance on valid input
2. Last Name → Auto-advance on valid input  
3. Email → Real-time validation + uniqueness check
4. Phone (Optional) → Italian format validation
5. Password → Real-time strength indicator
6. Confirm Password → Real-time match validation
7. Submit → Full form validation

Validation Timing:
- On Blur: Field-level validation
- On Change: Password strength, email format
- On Submit: Complete form validation
- Real-time: Email uniqueness, password match
```

### Login Flow

#### Returning User Login Journey
```
1. App Access Attempt (or Direct Login)
   ↓
2. Login Page (/auth/login)
   ├── Email/Password Form
   ├── Google OAuth Alternative
   ├── "Forgot Password" Link
   └── "Sign Up" Link
   ↓
3. Credential Submission
   ├── Email validation
   ├── Password validation
   └── Authentication attempt
   ↓
4. Authentication Response
   ├── Success → Token storage → Dashboard redirect
   ├── Invalid Credentials → Error message + retry
   ├── Unverified Email → Verification reminder
   └── Account Issues → Support guidance
   ↓
5. Dashboard Access (with role-based permissions)
```

#### Login Form Interaction Flow
```
Field Entry:
1. Email → Format validation on blur
2. Password → Show/hide toggle available
3. "Sign In" → Form submission

Remember Me Option:
- Checkbox for extended session (7 days vs 1 day)
- Affects refresh token lifetime
- Clearly labeled with duration

Error Handling:
- Invalid credentials → Clear, actionable message
- Rate limiting → Cooldown period display
- Network errors → Retry mechanism
- Account locked → Support contact info
```

## UI Specifications

### Registration Page UI

#### Layout Structure
```
Mobile Layout (< 768px):
┌─────────────────────────────────┐
│                                 │ ← 10vh top spacing
│           🍸 Barback            │ ← Logo + wordmark
│      Create Your Account        │ ← Page title
│                                 │ ← 2rem spacing
│  ┌─────────────────────────┐   │ ← Form container
│  │ 👤 First Name           │   │   (max-width: 400px)
│  │ [Input Field]           │   │   (auto-width with padding)
│  ├─────────────────────────┤   │
│  │ 👤 Last Name            │   │ ← 1rem gap between fields
│  │ [Input Field]           │   │
│  ├─────────────────────────┤   │
│  │ 📧 Email                │   │
│  │ [Input Field]           │   │
│  │ ❌ Email already exists │   │ ← Error state example
│  ├─────────────────────────┤   │
│  │ 📱 Phone (Optional)     │   │
│  │ [+39 3XX XXX XXXX]     │   │ ← Italian format placeholder
│  ├─────────────────────────┤   │
│  │ 🔒 Password             │   │
│  │ [••••••••••] [👁]      │   │ ← Show/hide toggle
│  │                         │   │
│  │ Password Requirements:   │   │ ← Real-time validation
│  │ ✓ At least 8 characters │   │ ← Green when met
│  │ ✗ One uppercase letter  │   │ ← Red when not met
│  │ ✓ One lowercase letter  │   │
│  │ ✓ One number            │   │
│  │ ✗ One symbol           │   │
│  ├─────────────────────────┤   │
│  │ 🔒 Confirm Password     │   │
│  │ [••••••••••] [👁]      │   │
│  │ ✗ Passwords must match  │   │ ← Match validation
│  ├─────────────────────────┤   │
│  │                         │   │ ← 1.5rem top margin
│  │    Create Account       │   │ ← Primary button (44px min height)
│  │                         │   │   (Gold/amber background)
│  └─────────────────────────┘   │   (Full width of container)
│                                 │ ← 1.5rem spacing
│          ─── OR ───             │ ← Divider with text
│                                 │ ← 1rem spacing
│  ┌─────────────────────────┐   │
│  │ 🔍 Continue with Google │   │ ← Secondary button
│  └─────────────────────────┘   │   (White bg, gray border)
│                                 │ ← 2rem spacing
│   Already have an account?      │ ← Footer links
│           Sign in               │   (Center aligned)
│                                 │ ← 5vh bottom spacing
└─────────────────────────────────┘
```

#### Component Specifications
```tsx
// Form container
<div className="max-w-md mx-auto px-4 pt-[10vh] pb-[5vh]">
  
  // Brand header
  <div className="text-center mb-8">
    <div className="text-2xl font-bold text-amber-600">🍸 Barback</div>
    <h1 className="text-xl font-semibold text-gray-900 mt-2">
      Create Your Account
    </h1>
  </div>

  // Registration form
  <form className="space-y-4">
    
    // Name fields (side by side on larger screens)
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input
        name="firstName"
        icon={User}
        placeholder="First Name"
        required
        maxLength={50}
      />
      <Input
        name="lastName"
        icon={User}
        placeholder="Last Name"
        required
        maxLength={50}
      />
    </div>

    // Email field with validation
    <div>
      <Input
        name="email"
        type="email"
        icon={Mail}
        placeholder="Email"
        required
        autoComplete="email"
      />
      {emailError && (
        <p className="mt-1 text-sm text-red-600">{emailError}</p>
      )}
    </div>

    // Phone field (optional)
    <PhoneInput
      name="phoneNumber"
      country="IT"
      placeholder="+39 3XX XXX XXXX"
      autoComplete="tel"
    />

    // Password field with requirements
    <div>
      <PasswordInput
        name="password"
        icon={Lock}
        placeholder="Password"
        required
        showToggle
      />
      <PasswordRequirements 
        password={formData.password}
        className="mt-2"
      />
    </div>

    // Confirm password
    <div>
      <PasswordInput
        name="confirmPassword"
        icon={Lock}
        placeholder="Confirm Password"
        required
        showToggle
      />
      <PasswordMatch 
        password={formData.password}
        confirm={formData.confirmPassword}
        className="mt-1"
      />
    </div>

    // Submit button
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="w-full mt-6"
      disabled={!isFormValid || isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Spinner className="mr-2" />
          Creating Account...
        </>
      ) : (
        'Create Account'
      )}
    </Button>

    // OAuth divider
    <Divider className="my-6">OR</Divider>

    // Google OAuth button
    <GoogleLoginButton />

  </form>

  // Footer links
  <div className="text-center mt-8">
    <p className="text-sm text-gray-600">
      Already have an account?{' '}
      <Link to="/auth/login" className="font-medium text-amber-600 hover:text-amber-500">
        Sign in
      </Link>
    </p>
  </div>
</div>
```

### Login Page UI

#### Layout Structure
```
Mobile Layout (< 768px):
┌─────────────────────────────────┐
│                                 │ ← 10vh top spacing
│           🍸 Barback            │ ← Logo + wordmark
│      Premium Inventory          │ ← Tagline
│                                 │ ← 3rem spacing
│  ┌─────────────────────────┐   │ ← Form container
│  │ 📧 Email                │   │   (max-width: 400px)
│  │ [email@example.com]     │   │
│  ├─────────────────────────┤   │ ← 1rem gap
│  │ 🔒 Password             │   │
│  │ [••••••••••] [👁]      │   │ ← Show/hide toggle
│  ├─────────────────────────┤   │
│  │ ☐ Remember me (7 days)  │   │ ← Remember checkbox
│  ├─────────────────────────┤   │
│  │                         │   │ ← 1.5rem top margin
│  │       Sign In           │   │ ← Primary button
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │ ← 1.5rem spacing
│          ─── OR ───             │ ← Divider
│                                 │ ← 1rem spacing
│  ┌─────────────────────────┐   │
│  │ 🔍 Continue with Google │   │ ← Google OAuth button
│  └─────────────────────────┘   │
│                                 │ ← 2rem spacing
│   Forgot password? • Sign up    │ ← Action links
│                                 │ ← 5vh bottom spacing
└─────────────────────────────────┘
```

#### Component Specifications
```tsx
// Login form container
<div className="max-w-md mx-auto px-4 pt-[10vh] pb-[5vh]">
  
  // Brand header
  <div className="text-center mb-12">
    <div className="text-2xl font-bold text-amber-600">🍸 Barback</div>
    <p className="text-lg text-gray-600 mt-2">Premium Inventory</p>
  </div>

  // Login form
  <form className="space-y-4">
    
    // Email field
    <Input
      name="email"
      type="email"
      icon={Mail}
      placeholder="Email"
      required
      autoComplete="email"
      autoFocus
    />

    // Password field
    <PasswordInput
      name="password"
      icon={Lock}
      placeholder="Password"
      required
      showToggle
      autoComplete="current-password"
    />

    // Remember me option
    <div className="flex items-center">
      <Checkbox
        id="remember"
        name="remember"
        className="mr-2"
      />
      <Label htmlFor="remember" className="text-sm text-gray-600">
        Remember me (7 days)
      </Label>
    </div>

    // Submit button
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="w-full mt-6"
      disabled={!isFormValid || isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Spinner className="mr-2" />
          Signing In...
        </>
      ) : (
        'Sign In'
      )}
    </Button>

    // OAuth divider
    <Divider className="my-6">OR</Divider>

    // Google OAuth button
    <GoogleLoginButton />

  </form>

  // Footer links
  <div className="text-center mt-8 space-y-2">
    <Link 
      to="/auth/forgot-password" 
      className="text-sm text-amber-600 hover:text-amber-500"
    >
      Forgot password?
    </Link>
    <span className="text-sm text-gray-400 mx-2">•</span>
    <Link 
      to="/auth/register" 
      className="text-sm text-amber-600 hover:text-amber-500"
    >
      Sign up
    </Link>
  </div>
</div>
```

## Technical Implementation

### Registration Technical Flow

#### Frontend Registration Process
```typescript
// 1. Form Submission Handler
const handleRegistration = async (formData: RegisterFormData) => {
  try {
    // Client-side validation
    const validatedData = registerSchema.parse(formData);
    
    // API call to backend
    const response = await authAPI.register({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber // optional
    });

    // Store tokens in auth store
    authStore.setTokens(response.access_token, response.refresh_token);
    
    // Store user data
    authStore.setUser({
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      emailVerified: false // New users need verification
    });

    // Redirect to email verification page
    navigate('/auth/verify-email');
    
    // Show success toast
    toast.success('Account created! Please verify your email.');
    
  } catch (error) {
    // Handle validation or API errors
    if (error instanceof z.ZodError) {
      setFormErrors(error.flatten().fieldErrors);
    } else if (error.response?.status === 409) {
      setFormErrors({ email: ['Email already exists'] });
    } else {
      toast.error('Registration failed. Please try again.');
    }
  }
};
```

#### API Integration
```typescript
// 2. API Client Configuration
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.json());
    }

    return response.json();
  }
};

// 3. Auth Store Integration
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,

  setTokens: (accessToken: string, refreshToken: string) => {
    const tokens = { accessToken, refreshToken };
    
    // Store in memory
    set({ tokens, isAuthenticated: true });
    
    // Persist to localStorage
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  },

  setUser: (user: User) => {
    set({ user });
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, tokens: null, isAuthenticated: false });
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  }
}));
```

### Login Technical Flow

#### Frontend Login Process
```typescript
// 1. Login Handler
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(credentials);
    
    // API authentication
    const response = await authAPI.login(validatedData);
    
    // Store authentication data
    authStore.setTokens(response.access_token, response.refresh_token);
    
    // Fetch user profile
    const userProfile = await authAPI.getProfile();
    authStore.setUser(userProfile);
    
    // Check email verification status
    if (!userProfile.emailVerified) {
      navigate('/auth/verify-email');
      toast.warning('Please verify your email to access all features.');
      return;
    }
    
    // Check organization membership
    const organizations = await organizationAPI.getUserOrganizations();
    
    if (organizations.length === 0) {
      // New user needs to create or join organization
      navigate('/onboarding/organization');
    } else {
      // Set default organization and redirect to dashboard
      appStore.setSelectedOrganization(organizations[0]);
      navigate('/dashboard');
    }
    
    toast.success('Welcome back!');
    
  } catch (error) {
    if (error.response?.status === 401) {
      setFormErrors({ general: ['Invalid email or password'] });
    } else if (error.response?.status === 429) {
      setFormErrors({ general: ['Too many attempts. Please try again later.'] });
    } else {
      toast.error('Login failed. Please check your connection.');
    }
  }
};
```

#### Token Management
```typescript
// 2. Automatic Token Refresh
export const useTokenRefresh = () => {
  const { tokens, setTokens, logout } = useAuthStore();
  
  useEffect(() => {
    if (!tokens?.refreshToken) return;
    
    // Set up automatic refresh before expiration
    const refreshTimer = setInterval(async () => {
      try {
        const response = await authAPI.refreshToken(tokens.refreshToken);
        setTokens(response.access_token, response.refresh_token);
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout(); // Force logout on refresh failure
        navigate('/auth/login');
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes (access token expires in 15)
    
    return () => clearInterval(refreshTimer);
  }, [tokens?.refreshToken]);
};

// 3. API Request Interceptor
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const { tokens } = useAuthStore.getState();
  
  if (tokens?.accessToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${tokens.accessToken}`,
    };
  }
  
  const response = await fetch(url, options);
  
  // Handle 401 responses
  if (response.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/auth/login';
    throw new Error('Authentication required');
  }
  
  return response;
};
```

### Form Validation Schemas

```typescript
// Zod validation schemas
export const registerSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Zàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýžźż\s-']+$/, 'First name contains invalid characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Zàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýžźż\s-']+$/, 'Last name contains invalid characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  
  phoneNumber: z.string()
    .regex(/^\+39\s3[0-9]{2}\s[0-9]{3}\s[0-9]{4}$/, 'Please enter a valid Italian mobile number (+39 3XX XXX XXXX)')
    .optional(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and symbol'),
  
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Password is required'),
  
  remember: z.boolean().optional()
});
```

### Error Handling & User Feedback

```typescript
// Comprehensive error handling
export const AuthErrorHandler = {
  registration: {
    409: 'An account with this email already exists',
    400: 'Please check your information and try again',
    429: 'Too many registration attempts. Please try again later',
    500: 'Registration service is temporarily unavailable'
  },
  
  login: {
    401: 'Invalid email or password',
    423: 'Account is temporarily locked. Please try again later',
    429: 'Too many login attempts. Please try again later',
    500: 'Login service is temporarily unavailable'
  },
  
  network: 'Please check your internet connection and try again',
  
  default: 'An unexpected error occurred. Please try again'
};

// User feedback integration
export const useAuthFeedback = () => {
  const showError = (error: AuthError) => {
    const message = AuthErrorHandler[error.type]?.[error.status] || 
                   AuthErrorHandler.default;
    
    toast.error(message, {
      duration: 5000,
      action: error.status >= 500 ? {
        label: 'Retry',
        onClick: () => window.location.reload()
      } : undefined
    });
  };
  
  const showSuccess = (type: 'registration' | 'login') => {
    const messages = {
      registration: 'Account created successfully! Please check your email.',
      login: 'Welcome back to Barback!'
    };
    
    toast.success(messages[type], { duration: 3000 });
  };
  
  return { showError, showSuccess };
};
```

This documentation provides a comprehensive guide to email/password authentication, covering user experience flows, detailed UI specifications, and technical implementation details for the Barback application.
