# Google OAuth Authentication

## Feature Overview

Google OAuth integration provides a streamlined authentication option for Barback users, allowing them to register and login using their Google accounts. This reduces friction for new users while maintaining security standards.

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

#### OAuth Configuration
```typescript
// Google OAuth configuration
export const GOOGLE_OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirectUri: `${window.location.origin}/auth/oauth/google/callback`,
  scope: 'openid email profile',
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent' // Ensures refresh token
};

// OAuth URL generation
export const generateGoogleOAuthURL = (state?: string): string => {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    scope: GOOGLE_OAUTH_CONFIG.scope,
    response_type: GOOGLE_OAUTH_CONFIG.responseType,
    access_type: GOOGLE_OAUTH_CONFIG.accessType,
    prompt: GOOGLE_OAUTH_CONFIG.prompt,
    ...(state && { state })
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};
```

#### OAuth Flow Implementation
```typescript
// Google OAuth hook
export const useGoogleOAuth = () => {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  
  const initiateOAuth = useCallback((mode: 'login' | 'register') => {
    // Generate state parameter for security
    const state = generateRandomState();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_mode', mode);
    
    // Build OAuth URL
    const oauthUrl = generateGoogleOAuthURL(state);
    
    // Redirect to Google
    window.location.href = oauthUrl;
  }, []);
  
  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid OAuth state parameter');
      }
      
      // Exchange code for tokens
      const response = await authAPI.googleOAuth({
        code,
        redirectUri: GOOGLE_OAUTH_CONFIG.redirectUri
      });
      
      // Store authentication data
      setTokens(response.access_token, response.refresh_token);
      setUser(response.user);
      
      // Clean up session storage
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('oauth_mode');
      
      // Redirect based on user state
      if (response.user.emailVerified) {
        if (response.user.organizations?.length > 0) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding/organization');
        }
      } else {
        navigate('/auth/verify-email');
      }
      
      toast.success('Successfully signed in with Google!');
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      navigate('/auth/login', { 
        state: { error: 'OAuth authentication failed' }
      });
    }
  }, [setTokens, setUser, navigate]);
  
  return {
    initiateOAuth,
    handleOAuthCallback
  };
};

// OAuth callback page component
export const GoogleOAuthCallback: React.FC = () => {
  const { handleOAuthCallback } = useGoogleOAuth();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      // Handle OAuth errors
      console.error('OAuth error:', error);
      navigate('/auth/login', {
        state: { error: `OAuth error: ${error}` }
      });
      return;
    }
    
    if (code && state) {
      handleOAuthCallback(code, state);
    } else {
      navigate('/auth/login', {
        state: { error: 'Invalid OAuth response' }
      });
    }
  }, [searchParams, handleOAuthCallback]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner className="w-8 h-8 mx-auto mb-4" />
        <p className="text-lg text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};
```

### Backend OAuth Integration

#### OAuth Endpoint Implementation
```typescript
// Backend OAuth handler (for reference)
export const googleOAuthHandler = async (req: Request, res: Response) => {
  try {
    const { code, redirectUri } = req.body;
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    
    const tokens = await tokenResponse.json();
    
    // Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });
    
    const googleProfile = await profileResponse.json();
    
    // Find or create user
    let user = await User.findOne({ email: googleProfile.email });
    
    if (!user) {
      // Create new user from Google profile
      user = await User.create({
        email: googleProfile.email,
        firstName: googleProfile.given_name,
        lastName: googleProfile.family_name,
        emailVerified: true, // Trust Google-verified emails
        authProvider: 'google',
        googleId: googleProfile.id
      });
    } else if (!user.googleId) {
      // Link existing account to Google
      user.googleId = googleProfile.id;
      user.authProvider = 'google';
      await user.save();
    }
    
    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        organizations: await user.getOrganizations()
      }
    });
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(400).json({
      error: 'OAuth authentication failed',
      message: error.message
    });
  }
};
```

### Security Considerations

#### OAuth Security Implementation
```typescript
// State parameter generation for CSRF protection
export const generateRandomState = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// OAuth security validations
export const validateOAuthCallback = (
  receivedState: string,
  storedState: string | null
): boolean => {
  if (!storedState || !receivedState) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (receivedState.length !== storedState.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < receivedState.length; i++) {
    result |= receivedState.charCodeAt(i) ^ storedState.charCodeAt(i);
  }
  
  return result === 0;
};

// Secure token storage
export const secureTokenStorage = {
  store: (tokens: AuthTokens) => {
    // Encrypt sensitive data before localStorage storage
    const encryptedTokens = encrypt(JSON.stringify(tokens));
    localStorage.setItem('auth_tokens', encryptedTokens);
  },
  
  retrieve: (): AuthTokens | null => {
    const encryptedTokens = localStorage.getItem('auth_tokens');
    if (!encryptedTokens) return null;
    
    try {
      const decryptedTokens = decrypt(encryptedTokens);
      return JSON.parse(decryptedTokens);
    } catch {
      // Remove corrupted tokens
      localStorage.removeItem('auth_tokens');
      return null;
    }
  },
  
  clear: () => {
    localStorage.removeItem('auth_tokens');
  }
};
```

### Error Handling & Fallbacks

#### Comprehensive OAuth Error Handling
```typescript
// OAuth error types and handling
export enum OAuthErrorType {
  ACCESS_DENIED = 'access_denied',
  POPUP_BLOCKED = 'popup_blocked',
  NETWORK_ERROR = 'network_error',
  INVALID_REQUEST = 'invalid_request',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export class OAuthError extends Error {
  constructor(
    public type: OAuthErrorType,
    public message: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

// Error detection and handling
export const handleOAuthError = (error: string | Error): OAuthError => {
  if (typeof error === 'string') {
    switch (error) {
      case 'access_denied':
        return new OAuthError(
          OAuthErrorType.ACCESS_DENIED,
          'Google sign-in was cancelled',
          true
        );
      case 'popup_blocked':
        return new OAuthError(
          OAuthErrorType.POPUP_BLOCKED,
          'Pop-up was blocked by your browser',
          true
        );
      default:
        return new OAuthError(
          OAuthErrorType.UNKNOWN_ERROR,
          'An unexpected error occurred',
          true
        );
    }
  }
  
  if (error.message.includes('network')) {
    return new OAuthError(
      OAuthErrorType.NETWORK_ERROR,
      'Network connection error',
      true
    );
  }
  
  return new OAuthError(
    OAuthErrorType.SERVER_ERROR,
    'Authentication service error',
    true
  );
};

// Retry mechanism for OAuth operations
export const useOAuthRetry = () => {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (retryCount >= maxRetries) {
      throw new Error('Maximum retry attempts exceeded');
    }
    
    try {
      await operation();
      setRetryCount(0); // Reset on success
    } catch (error) {
      setRetryCount(prev => prev + 1);
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      throw error;
    }
  }, [retryCount, maxRetries]);
  
  return { retry, canRetry: retryCount < maxRetries };
};
```

This documentation provides comprehensive coverage of Google OAuth authentication integration, including user flows, UI specifications, and detailed technical implementation for secure OAuth handling in the Barback application.
