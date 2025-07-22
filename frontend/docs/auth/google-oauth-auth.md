# Google OAuth Authentication

## Feature Overview

Google OAuth integration provides a streamlined authentication option for Barback users, allowing them to register and login using their Google accounts. This reduces friction for new users while maintaining security standards.

The backend now provides comprehensive Google OAuth endpoints that handle both direct redirect flows and programmatic OAuth flows for maximum flexibility.

## Backend API Endpoints

### GET /api/auth/oauth/google
Generate Google OAuth authorization URL with state parameter for security.

**Response** (200 OK):
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "random_state_string_for_security"
}
```

### POST /api/auth/oauth/google/callback
Handle OAuth callback with authorization code (for programmatic flows).

**Request Body**:
```json
{
  "code": "authorization_code_from_google",
  "state": "state_parameter_for_validation"
}
```


## User Experience Flows

### Google OAuth Registration Flow

#### New User Google Registration Journey
```
1. User Discovers Barback
   ↓
2. Registration Page (/auth/register)
   ├── Standard email/password form
   └── "Continue with Google" button
   ↓
3. Google OAuth Initiation
   ├── User clicks "Continue with Google"
   ├── Frontend initiates OAuth flow
   └── Redirect to Google consent screen
   ↓
4. Google Authorization
   ├── User signs into Google (if not already)
   ├── Google shows Barback permission request
   ├── User grants permissions (email, profile)
   └── Google redirects back with authorization code
   ↓
5. Backend Processing
   ├── Exchange code for Google tokens
   ├── Fetch user profile from Google
   ├── Create/update user account
   └── Generate Barback JWT tokens
   ↓
6. Account Setup Completion
   ├── Auto-verified email (trusted Google email)
   ├── Pre-filled profile information
   └── Redirect to organization setup or dashboard
   ↓
7. First-time Experience
   ├── Organization creation/joining flow
   └── Dashboard onboarding
```

#### Google OAuth User Experience Details
```
Consent Screen Information:
- App Name: "Barback - Premium Inventory"
- Permissions Requested:
  * Email address (required)
  * Basic profile info (name, profile picture)
- Privacy Policy & Terms links
- Clear explanation of data usage

User Benefits Messaging:
- "Quick setup with your Google account"
- "No password to remember"
- "Secure authentication through Google"
- "Your Google data stays private"
```

### Google OAuth Login Flow

#### Returning User Google Login Journey
```
1. Login Page Access (/auth/login)
   ├── Email/password option
   └── "Continue with Google" button
   ↓
2. Google OAuth Recognition
   ├── User clicks "Continue with Google"
   ├── Google recognizes returning user
   └── Streamlined consent (if previously authorized)
   ↓
3. Fast Authentication
   ├── Google verifies user identity
   ├── Returns authorization code
   └── Backend validates and creates session
   ↓
4. Immediate Access
   ├── Tokens stored in auth store
   ├── User profile loaded
   └── Redirect to last used organization/dashboard
```

### OAuth Error Handling Flow

#### Error Scenarios and Recovery
```
1. User Cancels OAuth
   ├── Google redirects back with error=access_denied
   ├── Show friendly message: "Sign in cancelled"
   ├── Return to login/register page
   └── Preserve original form data if available

2. OAuth Permission Denied
   ├── User denies required permissions
   ├── Explain why permissions are needed
   ├── Offer retry option
   └── Fallback to email/password registration

3. Account Linking Issues
   ├── Email already exists with password account
   ├── Prompt user to sign in with password first
   ├── Offer account linking in settings
   └── Prevent duplicate accounts

4. Google Service Errors
   ├── OAuth service temporarily unavailable
   ├── Show error with retry option
   ├── Fallback to manual registration
   └── Contact support if persistent
```

## UI Specifications

### Google OAuth Button UI

#### Button Design Specifications
```
Google Button Layout:
┌─────────────────────────────────┐
│  🔍  Continue with Google       │ ← Google logo + text
└─────────────────────────────────┘

Visual Design:
- Width: Full width of form container
- Height: 44px minimum (touch-friendly)
- Background: White (#FFFFFF)
- Border: 1px solid #DADCE0 (Google gray)
- Border Radius: 6px (matches other form elements)
- Text: #3C4043 (Google dark gray)
- Font: Same as primary buttons (system font)
- Google Logo: Official Google "G" logo (16px)

Hover States:
- Background: #F8F9FA (light gray)
- Border: #DADCE0 (unchanged)
- Subtle shadow: 0 1px 3px rgba(0,0,0,0.1)

Pressed/Active States:
- Background: #F1F3F4
- No additional border changes
- Maintain accessibility contrast

Loading States:
- Show spinner replacing Google logo
- Text changes to "Connecting to Google..."
- Button disabled during OAuth flow
```

#### Component Implementation
```tsx
// Google OAuth Button Component
interface GoogleLoginButtonProps {
  mode: 'login' | 'register';
  onSuccess: (response: GoogleOAuthResponse) => void;
  onError: (error: GoogleOAuthError) => void;
  disabled?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  mode,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Initiate Google OAuth flow
      const response = await initiateGoogleOAuth(mode);
      onSuccess(response);
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn(
        "w-full bg-white border-gray-300 text-gray-700",
        "hover:bg-gray-50 hover:border-gray-300",
        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Spinner className="w-4 h-4 mr-3" />
          Connecting to Google...
        </>
      ) : (
        <>
          <GoogleIcon className="w-4 h-4 mr-3" />
          Continue with Google
        </>
      )}
    </Button>
  );
};

// Google Icon Component (SVG)
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);
```

### OAuth Loading States

#### Loading UI During OAuth Flow
```
OAuth Flow Loading States:

1. Button Click State:
┌─────────────────────────────────┐
│  ⟳  Connecting to Google...     │ ← Spinner + status text
└─────────────────────────────────┘

2. Redirect State (Optional overlay):
┌─────────────────────────────────┐
│                                 │
│         Redirecting to          │ ← Modal overlay
│            Google               │   (prevents double-clicks)
│                                 │
│            ⟳                    │ ← Large spinner
│                                 │
└─────────────────────────────────┘

3. Return Processing State:
┌─────────────────────────────────┐
│  ⟳  Completing sign in...       │ ← Processing callback
└─────────────────────────────────┘
```

### OAuth Error UI States

#### Error Message Display
```typescript
// Error state components
const OAuthErrorDisplay: React.FC<{ error: GoogleOAuthError }> = ({ error }) => {
  const getErrorMessage = (error: GoogleOAuthError) => {
    switch (error.type) {
      case 'access_denied':
        return {
          title: 'Sign in cancelled',
          message: 'You can still sign in with email and password below.',
          action: 'Try again'
        };
      case 'popup_blocked':
        return {
          title: 'Pop-up blocked',
          message: 'Please allow pop-ups for this site and try again.',
          action: 'Retry'
        };
      case 'network_error':
        return {
          title: 'Connection error',
          message: 'Please check your internet connection.',
          action: 'Retry'
        };
      default:
        return {
          title: 'Sign in failed',
          message: 'Please try again or use email and password.',
          action: 'Retry'
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{errorInfo.title}</AlertTitle>
      <AlertDescription>
        {errorInfo.message}
        {error.retryable && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={error.onRetry}
          >
            {errorInfo.action}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
```

## Technical Implementation

### Frontend OAuth Integration

The frontend OAuth implementation has been simplified to use the backend's OAuth endpoints directly. The backend handles all OAuth complexity including state generation, token exchange, and security validation.

#### OAuth Button Implementation
```typescript
// Google OAuth Button Component
import { authApi } from '@/lib/auth-api';

export const GoogleLoginButton: React.FC = () => {
  const { isLoggingIn } = useAuth();

  const handleGoogleLogin = () => {
    // Direct redirect to backend OAuth endpoint
    // Backend handles OAuth flow and redirects back with tokens
    window.location.href = authApi.googleOAuth.getRedirectUrl();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isLoggingIn}
    >
      {isLoggingIn ? (
        <>
          <InlineSpinner className="mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <GoogleIcon className="mr-2" />
          Continue with Google
        </>
      )}
    </Button>
  );
};
```

#### OAuth API Integration
```typescript
// Auth API with Google OAuth endpoints
export const authApi = {
  // ... other auth methods ...

  googleOAuth: {
    // Get the redirect URL for Google OAuth
    getRedirectUrl: (): string => {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';
      return `${apiBaseUrl}/api/auth/oauth/google/redirect`;
    },

    // Handle OAuth callback from Google (for programmatic flows)
    callback: (data: { code: string; state?: string }): Promise<AuthResponse> => {
      return apiClient.request<AuthResponse>('/auth/oauth/google/callback', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};
```

#### OAuth Callback Handling

**For POST Callback (Programmatic)**:
```typescript
// OAuth callback page for programmatic flows
export const GoogleOAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          void navigate('/auth/login');
          return;
        }

        if (!code) {
          console.error('Invalid OAuth response');
          void navigate('/auth/login');
          return;
        }

        // Exchange code for tokens
        const response = await authApi.googleOAuth.callback({ 
          code, 
          ...(state && { state }),
        });

        // Store authentication data
        login(response.user, response.access_token, response.refresh_token);

        // Redirect based on user state
        if (!response.user.isEmailVerified) {
          void navigate('/auth/verify-email');
        } else {
          void navigate('/dashboard');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        void navigate('/auth/login');
      }
    };

    void handleOAuthCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner className="mx-auto" />
        <h2>Completing sign in...</h2>
      </div>
    </div>
  );
};
```

**For GET Callback (Browser Redirect)**:
```typescript
// OAuth success page for GET redirects
export const GoogleAuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthSuccess = () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (!accessToken || !refreshToken) {
        void navigate('/auth/login');
        return;
      }

      // Store tokens and redirect
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      void navigate('/dashboard');
    };

    handleAuthSuccess();
  }, [searchParams, navigate]);

  return <div>Redirecting...</div>;
};

// OAuth error page for GET redirects
export const GoogleAuthErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'access_denied':
        return 'Google sign-in was cancelled';
      case 'invalid_request':
        return 'Invalid authentication request';
      default:
        return 'Authentication failed';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
        <h2>{getErrorMessage(error)}</h2>
        <Button onClick={() => void navigate('/auth/login')}>
          Try Again
        </Button>
      </div>
    </div>
  );
};
```

#### Route Configuration
```typescript
// App.tsx routing
<Routes>
  {/* Regular auth routes */}
  <Route path="/auth/login" element={<LoginPage />} />
  <Route path="/auth/register" element={<RegisterPage />} />
  
  {/* OAuth callback routes */}
  <Route path="/auth/oauth/google/callback" element={<GoogleOAuthCallbackPage />} />
  
  {/* OAuth redirect routes (for GET callbacks) */}
  <Route path="/auth/success" element={<GoogleAuthSuccessPage />} />
  <Route path="/auth/error" element={<GoogleAuthErrorPage />} />
</Routes>
```

### OAuth Flow Summary

The updated OAuth implementation leverages the backend's comprehensive OAuth endpoints:

1. **Simple Redirect Flow**: Users click the Google login button → redirected to `/api/auth/oauth/google/redirect` → Google OAuth → backend handles callback → frontend receives success/error redirect

2. **Programmatic Flow**: Frontend can also use the `/api/auth/oauth/google/callback` POST endpoint for more control over the OAuth flow

3. **Error Handling**: Both flows include comprehensive error handling with user-friendly error pages

4. **Security**: Backend handles all OAuth security including state validation, token exchange, and user account linking

### Benefits of New Implementation

- **Simplified Frontend**: No need to manage OAuth URLs, state parameters, or token exchange
- **Enhanced Security**: Backend handles all security-sensitive operations
- **Flexible Integration**: Supports both direct redirect and programmatic flows
- **Better Error Handling**: Comprehensive error pages for all OAuth failure scenarios
- **Account Linking**: Automatic linking of Google accounts to existing email/password accounts

This implementation provides a robust, secure, and user-friendly Google OAuth integration that seamlessly integrates with the existing Barback authentication system.
