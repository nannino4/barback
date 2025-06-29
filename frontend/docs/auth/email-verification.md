# Email Verification

## Feature Overview

Email verification is a mandatory security feature that ensures users have access to their registered email address before they can fully access the Barback application. All new users must verify their email before accessing organization features.

## User Experience Flows

### Email Verification Required Flow

#### Post-Registration Verification Journey
```
1. Account Registration Complete
   ↓
2. Automatic Email Verification Send
   ├── System automatically sends verification email
   ├── User sees verification required page
   └── Clear instructions provided
   ↓
3. Email Verification Required Page (/auth/verify-email)
   ├── Prominent "check email" message
   ├── User's email address displayed
   ├── Resend email option (with cooldown)
   ├── Change email option
   └── Email tips and troubleshooting
   ↓
4. User Checks Email
   ├── Email with verification link received
   ├── Click verification link
   └── Link opens in browser
   ↓
5. Email Verification Success
   ├── Backend validates token
   ├── Account marked as verified
   ├── Success page displayed
   └── Auto-redirect to dashboard/organization setup
   ↓
6. Full App Access Granted
   ├── User can create/join organizations
   ├── All features unlocked
   └── Normal app experience
```

#### Verification Enforcement Flow
```
Unverified User Attempts Access:
1. User tries to access protected features
   ↓
2. Verification Check Middleware
   ├── Check user.emailVerified status
   ├── If false: Redirect to verification page
   └── If true: Allow access
   ↓
3. Verification Reminder
   ├── Clear explanation of requirement
   ├── Easy resend option
   └── Support contact if needed
```

### Email Resend Flow

#### Resend Email Verification Process
```
1. User on Verification Page
   ├── Initial email not received
   ├── Email in spam folder
   └── Email link expired
   ↓
2. Resend Email Request
   ├── Click "Resend Email" button
   ├── Button disabled for 60 seconds (rate limiting)
   └── Loading state shown
   ↓
3. New Email Sent
   ├── Fresh verification token generated
   ├── New email dispatched
   ├── Success feedback shown
   └── Countdown timer for next resend
   ↓
4. User Receives New Email
   ├── Fresh 24-hour expiration
   ├── New verification link
   └── Clear action instructions
```

### Change Email Flow

#### Email Address Change Process
```
1. User Realizes Email Error
   ├── Typo in email address
   ├── Inaccessible email account
   └── Wrong email used
   ↓
2. Change Email Request (/auth/change-email)
   ├── User clicks "Change email address"
   ├── Redirected to email change form
   └── Current email displayed
   ↓
3. New Email Submission
   ├── Enter new email address
   ├── Confirm new email address
   ├── Password confirmation required
   └── Submit change request
   ↓
4. Email Update & Verification
   ├── Account email updated
   ├── New verification email sent
   ├── Return to verification page
   └── Old verification tokens invalidated
```

### Verification Link Handling

#### Email Link Click Flow
```
1. User Clicks Email Link
   ├── Link format: /auth/verify-email/{token}
   ├── Opens in browser
   └── May open in new tab/window
   ↓
2. Token Validation
   ├── Backend validates token
   ├── Check token expiration (24 hours)
   ├── Check if already used
   └── Validate against user account
   ↓
3. Verification Result
   ├── Success: Account verified, redirect to dashboard
   ├── Expired: Friendly error, offer resend
   ├── Invalid: Error message, return to verification page
   └── Already verified: Confirmation, continue to app
   ↓
4. Post-Verification Actions
   ├── Update user.emailVerified = true
   ├── Invalidate verification token
   ├── Log verification event
   └── Trigger welcome email sequence
```

## UI Specifications

### Email Verification Required Page UI

#### Main Verification Page Layout
```
Mobile Layout (< 768px):
┌─────────────────────────────────┐
│                                 │ ← 10vh top spacing
│           🍸 Barback            │ ← Logo + wordmark
│                                 │ ← 3rem spacing
│         📧 Check Your Email     │ ← Large icon + title
│                                 │ ← 2rem spacing
│  We've sent a verification      │ ← Instructions text
│  link to your email address:   │   (center aligned)
│                                 │ ← 1rem spacing
│      user@example.com           │ ← User email (bold, large)
│                                 │ ← 2rem spacing
│  Click the link in the email    │ ← Action instructions
│  to verify your account and     │   (readable font size)
│  unlock all Barback features.   │
│                                 │ ← 1.5rem spacing
│  ⚠️ Email verification is       │ ← Warning notice
│  required to access your        │   (amber background)
│  organization and inventory.    │
│                                 │ ← 2rem spacing
│  ┌─────────────────────────┐   │
│  │     Resend Email        │   │ ← Secondary button
│  └─────────────────────────┘   │   (disabled if cooling down)
│                                 │
│  Next resend available in 45s   │ ← Cooldown timer
│                                 │ ← 2rem spacing
│  Didn't receive the email?      │ ← Troubleshooting section
│                                 │
│  • Check your spam folder       │ ← Helpful tips
│  • Ensure the email is correct  │   (bullet points)
│  • Contact support if needed    │
│                                 │ ← 1.5rem spacing
│      Change email address       │ ← Change email link
│                                 │ ← 5vh bottom spacing
└─────────────────────────────────┘
```

#### Component Implementation
```tsx
// Email Verification Page Component
export const EmailVerificationPage: React.FC = () => {
  const { user } = useAuthStore();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      await authAPI.resendVerificationEmail(user.email);
      
      // Start 60-second cooldown
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
      
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
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
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
              <Mail className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Check Your Email
            </h2>
          </div>

          {/* Instructions */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-4">
              We've sent a verification link to your email address:
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-4">
              {user.email}
            </p>
            <p className="text-sm text-gray-600">
              Click the link in the email to verify your account and unlock all Barback features.
            </p>
          </div>

          {/* Required Notice */}
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Email verification is required to access your organization and inventory.
            </AlertDescription>
          </Alert>

          {/* Resend Button */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendEmail}
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
            
            {resendCooldown > 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Next resend available in {resendCooldown} seconds
              </p>
            )}
          </div>

          {/* Troubleshooting Tips */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Didn't receive the email?
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your spam folder</li>
              <li>• Ensure the email address is correct</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>

          {/* Change Email Link */}
          <div className="text-center">
            <Link
              to="/auth/change-email"
              className="text-sm text-amber-600 hover:text-amber-500 font-medium"
            >
              Change email address
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Email Verification Success Page UI

#### Success Page Layout
```
Success Page Layout:
┌─────────────────────────────────┐
│           🍸 Barback            │
│                                 │
│         ✅ Email Verified!      │ ← Success icon + message
│                                 │
│  Your email has been verified   │ ← Confirmation text
│  successfully. You now have     │
│  full access to Barback.        │
│                                 │
│  ┌─────────────────────────┐   │
│  │    Continue to App      │   │ ← Primary CTA button
│  └─────────────────────────┘   │
│                                 │
│  Redirecting automatically      │ ← Auto-redirect notice
│  in 3 seconds...                │   with countdown
└─────────────────────────────────┘
```

#### Success Component
```tsx
// Email Verification Success Component
export const EmailVerificationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  
  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/dashboard');
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

        {/* Success Content */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Email Verified!
          </h2>
          
          <p className="text-sm text-gray-600 mb-8">
            Your email has been verified successfully. You now have full access to Barback.
          </p>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full mb-4"
            size="lg"
          >
            Continue to App
          </Button>

          {/* Auto-redirect Notice */}
          <p className="text-xs text-gray-500">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
};
```

### Change Email Page UI

#### Change Email Form Layout
```tsx
// Change Email Component
export const ChangeEmailPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const form = useForm({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
      confirmEmail: '',
      password: ''
    }
  });

  const handleChangeEmail = async (data: ChangeEmailFormData) => {
    try {
      await authAPI.changeEmail({
        newEmail: data.newEmail,
        password: data.password
      });
      
      toast.success('Email updated! Please verify your new email address.');
      navigate('/auth/verify-email');
    } catch (error) {
      if (error.response?.status === 409) {
        form.setError('newEmail', { message: 'Email already in use' });
      } else {
        toast.error('Failed to update email. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-amber-600 mb-2">
            🍸 Barback
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Change Email Address
          </h2>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {/* Current Email Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Current email:</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>

          <form onSubmit={form.handleSubmit(handleChangeEmail)} className="space-y-4">
            
            {/* New Email */}
            <div>
              <Input
                {...form.register('newEmail')}
                type="email"
                placeholder="New email address"
                icon={Mail}
                error={form.formState.errors.newEmail?.message}
              />
            </div>

            {/* Confirm Email */}
            <div>
              <Input
                {...form.register('confirmEmail')}
                type="email"
                placeholder="Confirm new email"
                icon={Mail}
                error={form.formState.errors.confirmEmail?.message}
              />
            </div>

            {/* Password Confirmation */}
            <div>
              <PasswordInput
                {...form.register('password')}
                placeholder="Current password"
                icon={Lock}
                error={form.formState.errors.password?.message}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Updating Email...
                </>
              ) : (
                'Update Email Address'
              )}
            </Button>

            {/* Cancel Link */}
            <div className="text-center">
              <Link
                to="/auth/verify-email"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Cancel and return to verification
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
```

## Technical Implementation

### Email Verification API Integration

#### Frontend Verification Handlers
```typescript
// Email verification API client
export const emailVerificationAPI = {
  
  // Resend verification email
  resendVerification: async (email: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/send-verification-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.message);
    }
  },
  
  // Verify email with token
  verifyEmail: async (token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.message);
    }
  },
  
  // Change email address
  changeEmail: async (data: ChangeEmailData): Promise<void> => {
    const { tokens } = useAuthStore.getState();
    
    const response = await fetch(`${API_BASE_URL}/auth/change-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(response.status, error.message);
    }
  }
};
```

#### Email Verification Hook
```typescript
// Custom hook for email verification logic
export const useEmailVerification = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  
  // Check if user needs email verification
  const needsVerification = useMemo(() => {
    return user && !user.emailVerified;
  }, [user]);
  
  // Handle verification token from URL
  const handleVerificationToken = useCallback(async (token: string) => {
    try {
      await emailVerificationAPI.verifyEmail(token);
      
      // Update user verification status
      updateUser({ ...user, emailVerified: true });
      
      toast.success('Email verified successfully!');
      
      // Redirect to dashboard or organization setup
      if (user.organizations?.length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/organization');
      }
      
    } catch (error) {
      console.error('Email verification failed:', error);
      
      if (error.status === 400) {
        toast.error('Verification link is invalid or expired.');
      } else {
        toast.error('Verification failed. Please try again.');
      }
      
      navigate('/auth/verify-email');
    }
  }, [user, updateUser, navigate]);
  
  // Enforce verification requirement
  const enforceVerification = useCallback(() => {
    if (needsVerification) {
      navigate('/auth/verify-email');
      return false;
    }
    return true;
  }, [needsVerification, navigate]);
  
  return {
    needsVerification,
    handleVerificationToken,
    enforceVerification
  };
};
```

#### Protected Route Component with Verification
```typescript
// Enhanced protected route with email verification
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const { needsVerification, enforceVerification } = useEmailVerification();
  const location = useLocation();
  
  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Check email verification for protected features
  const verificationExemptPaths = [
    '/auth/verify-email',
    '/auth/change-email',
    '/auth/logout'
  ];
  
  const isExemptPath = verificationExemptPaths.some(path => 
    location.pathname.startsWith(path)
  );
  
  if (needsVerification && !isExemptPath) {
    return <Navigate to="/auth/verify-email" replace />;
  }
  
  return <>{children}</>;
};
```

### Verification Token Handling

#### Token Validation and Processing
```typescript
// Email verification token processor
export const EmailVerificationProcessor = () => {
  const { handleVerificationToken } = useEmailVerification();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      handleVerificationToken(token);
    } else {
      // No token provided, redirect to verification page
      navigate('/auth/verify-email', { replace: true });
    }
  }, [searchParams, handleVerificationToken, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner className="w-8 h-8 mx-auto mb-4" />
        <p className="text-lg text-gray-600">Verifying your email...</p>
      </div>
    </div>
  );
};
```

### Validation Schemas

#### Email Verification Form Schemas
```typescript
// Change email validation schema
export const changeEmailSchema = z.object({
  newEmail: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  
  confirmEmail: z.string()
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(1, 'Password is required')
}).refine((data) => data.newEmail === data.confirmEmail, {
  message: 'Email addresses must match',
  path: ['confirmEmail'],
});

// Resend verification schema
export const resendVerificationSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
});
```

### Error Handling & Rate Limiting

#### Verification Error Management
```typescript
// Email verification error handling
export const useVerificationErrorHandling = () => {
  const handleVerificationError = useCallback((error: APIError) => {
    switch (error.status) {
      case 400:
        if (error.message.includes('expired')) {
          toast.error('Verification link has expired. We\'ll send you a new one.', {
            duration: 5000,
            action: {
              label: 'Resend',
              onClick: () => window.location.href = '/auth/verify-email'
            }
          });
        } else {
          toast.error('Invalid verification link. Please try again.');
        }
        break;
        
      case 409:
        toast.success('Email already verified! Redirecting to dashboard...');
        setTimeout(() => window.location.href = '/dashboard', 2000);
        break;
        
      case 429:
        toast.error('Too many verification attempts. Please wait before trying again.');
        break;
        
      default:
        toast.error('Verification failed. Please contact support if this continues.');
    }
  }, []);
  
  return { handleVerificationError };
};

// Rate limiting for resend operations
export const useResendRateLimit = () => {
  const [cooldown, setCooldown] = useState(0);
  const [lastResend, setLastResend] = useState<number | null>(null);
  
  const canResend = useMemo(() => {
    if (!lastResend) return true;
    
    const timeSinceLastResend = Date.now() - lastResend;
    return timeSinceLastResend >= 60000; // 60 second cooldown
  }, [lastResend, cooldown]);
  
  const startCooldown = useCallback(() => {
    setLastResend(Date.now());
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
    canResend,
    cooldown,
    startCooldown
  };
};
```

This documentation provides comprehensive coverage of the email verification feature, including mandatory verification flows, UI specifications, and technical implementation details for secure email verification in the Barback application.
