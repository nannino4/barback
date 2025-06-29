# Password Reset

## Feature Overview

The password reset feature provides a secure way for users to recover access to their accounts when they forget their passwords. The system uses time-limited email tokens and enforces strong password requirements during reset.

## User Experience Flows

### Forgot Password Flow

#### Password Recovery Initiation Journey
```
1. User Cannot Access Account
   ├── Forgotten password
   ├── Account lockout
   └── Password not working
   ↓
2. Access Password Reset
   ├── From login page: "Forgot password?" link
   ├── Direct URL: /auth/forgot-password
   └── From mobile app login screen
   ↓
3. Forgot Password Page (/auth/forgot-password)
   ├── Email address input
   ├── Clear instructions
   ├── Submit button
   └── Return to login link
   ↓
4. Email Submission
   ├── Email validation
   ├── Account lookup (silent)
   ├── Rate limiting check
   └── Generic success response (security)
   ↓
5. Reset Email Instructions (/auth/forgot-password/sent)
   ├── "Check your email" message
   ├── Email address confirmation
   ├── Resend option (with cooldown)
   └── Return to login link
   ↓
6. User Checks Email
   ├── Password reset email received
   ├── Secure reset link provided
   └── 15-minute expiration notice
```

#### Password Reset Email Flow
```
Email Content Structure:
1. Clear Subject: "Reset your Barback password"
2. Sender: Barback Security <security@barback.app>
3. Content:
   ├── Personalized greeting
   ├── Reset request confirmation
   ├── Secure reset button/link
   ├── Manual link as backup
   ├── Expiration time (15 minutes)
   ├── Security notice (ignore if not requested)
   └── Support contact information

Security Features:
- Unique, single-use token
- 15-minute expiration
- HTTPS-only reset links
- Clear security warnings
```

### Password Reset Completion Flow

#### Reset Form Completion Journey
```
1. User Clicks Reset Link
   ├── Email link: /auth/reset-password?token={token}
   ├── Opens in browser
   └── Token validation begins
   ↓
2. Token Validation
   ├── Backend validates token
   ├── Check expiration (15 minutes)
   ├── Verify single-use status
   └── Confirm account association
   ↓
3. Reset Password Form (/auth/reset-password)
   ├── New password input
   ├── Confirm password input
   ├── Password requirements display
   ├── Real-time validation
   └── Submit button
   ↓
4. Password Submission
   ├── Client-side validation
   ├── Password strength checking
   ├── Backend password update
   └── Token invalidation
   ↓
5. Reset Success Confirmation
   ├── Success message display
   ├── Auto-login option
   ├── Manual login redirect
   └── Security confirmation email
   ↓
6. Account Access Restored
   ├── User can log in with new password
   ├── All other sessions invalidated
   └── Account security improved
```

### Reset Link Error Handling

#### Invalid/Expired Token Flow
```
1. User Clicks Invalid/Expired Link
   ↓
2. Token Validation Failure
   ├── Expired token (> 15 minutes)
   ├── Already used token
   ├── Invalid token format
   └── Non-existent token
   ↓
3. Error Page Display (/auth/reset-password/error)
   ├── Clear error explanation
   ├── Friendly error message
   ├── New reset request option
   └── Support contact information
   ↓
4. Recovery Options
   ├── Request new reset link
   ├── Return to login page
   ├── Contact support
   └── Try different email address
```

## UI Specifications

### Forgot Password Page UI

#### Forgot Password Form Layout
```
Mobile Layout (< 768px):
┌─────────────────────────────────┐
│                                 │ ← 10vh top spacing
│           🍸 Barback            │ ← Logo + wordmark
│         Reset Password          │ ← Page title
│                                 │ ← 2rem spacing
│  Enter your email address and   │ ← Instructions text
│  we'll send you a link to       │   (readable, center-aligned)
│  reset your password.           │
│                                 │ ← 2rem spacing
│  ┌─────────────────────────┐   │ ← Form container
│  │ 📧 Email                │   │   (max-width: 400px)
│  │ [email@example.com]     │   │
│  ├─────────────────────────┤   │ ← 1.5rem spacing
│  │                         │   │
│  │    Send Reset Link      │   │ ← Primary button
│  │                         │   │   (full width, 44px height)
│  └─────────────────────────┘   │
│                                 │ ← 2rem spacing
│     Remember your password?     │ ← Footer links
│            Sign in              │   (center-aligned)
│                                 │ ← 5vh bottom spacing
└─────────────────────────────────┘
```

#### Component Implementation
```tsx
// Forgot Password Page Component
export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setEmailError('');
    
    try {
      await authAPI.forgotPassword(email);
      
      // Navigate to sent page with email
      navigate('/auth/forgot-password/sent', {
        state: { email }
      });
      
    } catch (error) {
      // Always show success message for security
      // (Don't reveal if email exists or not)
      navigate('/auth/forgot-password/sent', {
        state: { email }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-amber-600 mb-2">
            🍸 Barback
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Reset Password
          </h1>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                icon={Mail}
                error={emailError}
                autoFocus
                autoComplete="email"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6">
            <Link
              to="/auth/login"
              className="text-sm text-amber-600 hover:text-amber-500"
            >
              Remember your password? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Reset Email Sent Page UI

#### Email Sent Confirmation Layout
```
Email Sent Page Layout:
┌─────────────────────────────────┐
│           🍸 Barback            │
│                                 │
│         📧 Check Your Email     │ ← Icon + title
│                                 │
│  We've sent password reset      │ ← Instructions
│  instructions to:               │
│                                 │
│      user@example.com           │ ← User's email (bold)
│                                 │
│  The link will expire in        │ ← Expiration notice
│  15 minutes.                    │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Resend Email        │   │ ← Resend button
│  └─────────────────────────┘   │   (with cooldown)
│                                 │
│      Back to Sign In            │ ← Return link
└─────────────────────────────────┘
```

#### Email Sent Component
```tsx
// Forgot Password Email Sent Component
export const ForgotPasswordSentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const email = location.state?.email || '';
  
  // If no email provided, redirect to forgot password page
  useEffect(() => {
    if (!email) {
      navigate('/auth/forgot-password');
    }
  }, [email, navigate]);

  const handleResend = async () => {
    try {
      setIsResending(true);
      await authAPI.forgotPassword(email);
      
      // Start cooldown
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast.success('Reset email sent again!');
    } catch (error) {
      toast.error('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-amber-600 mb-2">
            🍸 Barback
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Email Icon and Title */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Check Your Email
            </h2>
          </div>

          {/* Instructions */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-4">
              We've sent password reset instructions to:
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-4">
              {email}
            </p>
            <p className="text-sm text-gray-600">
              The link will expire in <strong>15 minutes</strong>.
            </p>
          </div>

          {/* Resend Button */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
            >
              {isResending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Sending Email...
                </>
              ) : resendCooldown > 0 ? (
                `Resend Email (${resendCooldown}s)`
              ) : (
                'Resend Email'
              )}
            </Button>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm text-amber-600 hover:text-amber-500"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Reset Password Form UI

#### Password Reset Form Layout
```
Reset Form Layout:
┌─────────────────────────────────┐
│           🍸 Barback            │
│        Create New Password      │ ← Page title
│                                 │
│  ┌─────────────────────────┐   │ ← Form container
│  │ 🔒 New Password         │   │
│  │ [••••••••••] [👁]      │   │ ← Password with toggle
│  ├─────────────────────────┤   │
│  │ 🔒 Confirm Password     │   │
│  │ [••••••••••] [👁]      │   │ ← Confirmation field
│  ├─────────────────────────┤   │
│  │                         │   │
│  │    Update Password      │   │ ← Submit button
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Password Requirements:         │ ← Requirements list
│  ✓ At least 8 characters        │   (real-time validation)
│  ✗ One uppercase letter         │
│  ✓ One lowercase letter         │
│  ✓ One number                   │
│  ✗ One symbol                   │
└─────────────────────────────────┘
```

#### Reset Form Component
```tsx
// Password Reset Form Component
export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      navigate('/auth/forgot-password');
      return;
    }
    
    const validateToken = async () => {
      try {
        await authAPI.validateResetToken(token);
        setIsValidToken(true);
      } catch (error) {
        setIsValidToken(false);
        navigate('/auth/reset-password/error', {
          state: { error: 'Invalid or expired reset link' }
        });
      }
    };
    
    validateToken();
  }, [token, navigate]);

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    setIsSubmitting(true);
    
    try {
      await authAPI.resetPassword({
        token,
        newPassword: data.password
      });
      
      toast.success('Password updated successfully!');
      navigate('/auth/login', {
        state: { message: 'Password reset complete. Please sign in with your new password.' }
      });
      
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Reset link is invalid or expired. Please request a new one.');
        navigate('/auth/forgot-password');
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while validating token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-amber-600 mb-2">
            🍸 Barback
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Create New Password
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* New Password */}
            <div>
              <PasswordInput
                {...form.register('password')}
                placeholder="New Password"
                icon={Lock}
                showToggle
                error={form.formState.errors.password?.message}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <PasswordInput
                {...form.register('confirmPassword')}
                placeholder="Confirm Password"
                icon={Lock}
                showToggle
                error={form.formState.errors.confirmPassword?.message}
              />
            </div>

            {/* Password Requirements */}
            <PasswordRequirements 
              password={form.watch('password')}
              className="text-sm"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!form.formState.isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
```

## Technical Implementation

### Password Reset API Integration

#### Frontend Reset Handlers
```typescript
// Password reset API client
export const passwordResetAPI = {
  
  // Request password reset
  forgotPassword: async (email: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase() })
    });
    
    // Always return success for security (don't reveal if email exists)
    if (!response.ok && response.status !== 404) {
      throw new APIError(response.status, 'Failed to send reset email');
    }
  },
  
  // Validate reset token
  validateResetToken: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.message);
    }
  },
  
  // Reset password with token
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.message);
    }
  }
};
```

#### Password Reset Hook
```typescript
// Custom hook for password reset operations
export const usePasswordReset = () => {
  const navigate = useNavigate();
  
  // Initiate password reset
  const initiateReset = useCallback(async (email: string) => {
    try {
      await passwordResetAPI.forgotPassword(email);
      
      // Always navigate to success page (security)
      navigate('/auth/forgot-password/sent', {
        state: { email }
      });
      
      return { success: true };
    } catch (error) {
      // Even on error, show success for security
      navigate('/auth/forgot-password/sent', {
        state: { email }
      });
      
      return { success: true };
    }
  }, [navigate]);
  
  // Complete password reset
  const completeReset = useCallback(async (token: string, newPassword: string) => {
    try {
      await passwordResetAPI.resetPassword({
        token,
        newPassword
      });
      
      toast.success('Password updated successfully!');
      navigate('/auth/login', {
        state: { 
          message: 'Password reset complete. Please sign in with your new password.',
          email: '' // Could extract from token if needed
        }
      });
      
      return { success: true };
    } catch (error) {
      if (error.status === 400) {
        toast.error('Reset link is invalid or expired.');
        navigate('/auth/forgot-password');
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
      
      return { success: false, error };
    }
  }, [navigate]);
  
  return {
    initiateReset,
    completeReset
  };
};
```

### Token Security Implementation

#### Secure Token Handling
```typescript
// Reset token validation utilities
export const resetTokenUtils = {
  
  // Extract token from URL safely
  extractTokenFromURL: (searchParams: URLSearchParams): string | null => {
    const token = searchParams.get('token');
    
    // Basic token format validation
    if (!token || token.length < 32) {
      return null;
    }
    
    // Check for valid token characters (base64url)
    const tokenRegex = /^[A-Za-z0-9_-]+$/;
    if (!tokenRegex.test(token)) {
      return null;
    }
    
    return token;
  },
  
  // Validate token format client-side
  isValidTokenFormat: (token: string): boolean => {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Check minimum length (tokens should be at least 32 characters)
    if (token.length < 32) {
      return false;
    }
    
    // Check for valid base64url characters
    const base64urlRegex = /^[A-Za-z0-9_-]+$/;
    return base64urlRegex.test(token);
  },
  
  // Handle token expiration gracefully
  handleTokenExpiration: (navigate: NavigateFunction) => {
    toast.error('Reset link has expired. Please request a new one.', {
      duration: 5000,
      action: {
        label: 'New Reset',
        onClick: () => navigate('/auth/forgot-password')
      }
    });
  }
};
```

### Form Validation & Security

#### Reset Password Validation Schema
```typescript
// Password reset form validation
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and symbol'
    ),
  
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

// Forgot password validation
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
});
```

#### Password Strength Component
```tsx
// Enhanced password requirements component
export const PasswordRequirements: React.FC<{
  password: string;
  className?: string;
}> = ({ password, className }) => {
  const requirements = [
    { 
      text: 'At least 8 characters', 
      met: password.length >= 8,
      icon: password.length >= 8 ? CheckCircle : XCircle
    },
    { 
      text: 'One uppercase letter', 
      met: /[A-Z]/.test(password),
      icon: /[A-Z]/.test(password) ? CheckCircle : XCircle
    },
    { 
      text: 'One lowercase letter', 
      met: /[a-z]/.test(password),
      icon: /[a-z]/.test(password) ? CheckCircle : XCircle
    },
    { 
      text: 'One number', 
      met: /\d/.test(password),
      icon: /\d/.test(password) ? CheckCircle : XCircle
    },
    { 
      text: 'One symbol (!@#$%^&*)', 
      met: /[@$!%*?&]/.test(password),
      icon: /[@$!%*?&]/.test(password) ? CheckCircle : XCircle
    }
  ];

  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-sm font-medium text-gray-700 mb-2">
        Password Requirements:
      </p>
      {requirements.map((req, index) => {
        const Icon = req.icon;
        return (
          <div key={index} className="flex items-center space-x-2">
            <Icon 
              className={cn(
                'h-4 w-4',
                req.met ? 'text-green-500' : 'text-gray-400'
              )} 
            />
            <span 
              className={cn(
                'text-sm',
                req.met ? 'text-green-700' : 'text-gray-500'
              )}
            >
              {req.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
```

### Error Handling & User Feedback

#### Comprehensive Error Management
```typescript
// Password reset error handler
export const usePasswordResetErrors = () => {
  const navigate = useNavigate();
  
  const handleResetError = useCallback((error: APIError, context: 'request' | 'validate' | 'complete') => {
    switch (context) {
      case 'request':
        // Always show success for forgot password requests (security)
        break;
        
      case 'validate':
        switch (error.status) {
          case 400:
            toast.error('Reset link is invalid or expired.');
            navigate('/auth/forgot-password');
            break;
          case 404:
            toast.error('Reset link not found. Please request a new one.');
            navigate('/auth/forgot-password');
            break;
          default:
            toast.error('Unable to validate reset link. Please try again.');
            navigate('/auth/forgot-password');
        }
        break;
        
      case 'complete':
        switch (error.status) {
          case 400:
            if (error.message.includes('expired')) {
              toast.error('Reset link has expired. Please request a new one.');
              navigate('/auth/forgot-password');
            } else if (error.message.includes('used')) {
              toast.error('Reset link has already been used. Please request a new one.');
              navigate('/auth/forgot-password');
            } else {
              toast.error('Password reset failed. Please check your password and try again.');
            }
            break;
          case 422:
            toast.error('Password does not meet security requirements.');
            break;
          default:
            toast.error('Password reset failed. Please try again.');
        }
        break;
    }
  }, [navigate]);
  
  return { handleResetError };
};

// Rate limiting for password reset requests
export const useResetRateLimit = () => {
  const [lastRequest, setLastRequest] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const canRequest = useMemo(() => {
    if (!lastRequest) return true;
    
    const timeSinceLastRequest = Date.now() - lastRequest;
    return timeSinceLastRequest >= 60000; // 60 second cooldown
  }, [lastRequest]);
  
  const startCooldown = useCallback(() => {
    setLastRequest(Date.now());
    setCooldown(60);
    
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);
  
  return {
    canRequest,
    cooldown,
    startCooldown
  };
};
```

This documentation provides comprehensive coverage of the password reset feature, including secure token handling, user-friendly flows, detailed UI specifications, and robust technical implementation for the Barback application.
