# Session Management

## Feature Overview

Session management in Barback is JWT-based and stateless. The "session" is simply the presence of valid JWT tokens (access + refresh) stored in localStorage. There are no timers, expiration warnings, or complex session state - just reactive token refresh when the server returns 401 responses.

## User Experience Flows

### Session Lifecycle

#### Session Creation
```
1. Successful Authentication
   ├── Login/registration completion
   ├── JWT tokens received (access + refresh)
   └── Tokens stored in localStorage
   ↓
2. Active Session
   ├── User redirected to app
   ├── API requests include JWT in headers
   └── Server validates JWT independently
```

#### Session Maintenance
```
Stateless Operation:
1. Normal API Requests
   ├── Include JWT access token in Authorization header
   ├── Server validates JWT and processes request
   └── Continue seamlessly
   ↓
2. Token Refresh (on 401 only)
   ├── Server returns 401 Unauthorized
   ├── Client automatically uses refresh token
   ├── New tokens received and stored
   ├── Original request retried
   └── Session continues seamlessly
```

#### Session Termination
```
1. User Logout
   ├── User clicks logout
   ├── Clear tokens from localStorage
   ├── Redirect to login page
   └── Show logout confirmation
   ↓
2. Automatic Logout
   ├── Refresh token expired/invalid
   ├── Clear all stored tokens
   ├── Redirect to login
   └── Show session expired message
```

## UI Specifications

### Session State Indicators

```tsx
// Simple session indicator
const SessionIndicator: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">
        {user?.firstName} {user?.lastName}
      </span>
    </div>
  );
};
```

### Logout UI

```tsx
// User menu with logout
const UserMenu: React.FC = () => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

## Technical Implementation

### Token Storage

```typescript
// Simple JWT token storage
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  
  static store(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
  
  static retrieve(): AuthTokens | null {
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!accessToken || !refreshToken) return null;
    
    return { accessToken, refreshToken };
  }
  
  static clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
```

### Session State Management

```typescript
// Minimal auth store - session state derived from token presence
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  
  // Initialize from stored tokens
  initialize: () => {
    const tokens = TokenStorage.retrieve();
    if (tokens) {
      // Decode user info from JWT payload
      const user = decodeJWTPayload(tokens.accessToken);
      set({ user, isAuthenticated: true });
    }
  },
  
  // Set authenticated state
  setAuthenticated: (user: User, tokens: AuthTokens) => {
    TokenStorage.store(tokens);
    set({ user, isAuthenticated: true });
  },
  
  // Clear session
  logout: () => {
    TokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  }
}));
```

### API Interceptor

```typescript
// Simple API interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 responses by refreshing token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const tokens = TokenStorage.retrieve();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token');
        }
        
        // Refresh tokens
        const response = await api.post('/auth/refresh', {
          refreshToken: tokens.refreshToken
        });
        
        const newTokens = response.data;
        TokenStorage.store(newTokens);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api.request(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Data Flow

### Session Check Flow

```typescript
// Simple session validation
export const useAuth = () => {
  const { isAuthenticated, user, initialize } = useAuthStore();
  
  useEffect(() => {
    // Initialize session on app load
    initialize();
  }, []);
  
  // Session is valid if tokens exist and user is set
  const isSessionValid = isAuthenticated && user;
  
  return {
    isAuthenticated: isSessionValid,
    user,
    logout: useAuthStore.getState().logout
  };
};
```

### Route Protection

```typescript
// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

## Security Considerations

### Token Security
- JWT tokens stored in localStorage (acceptable for this MVP)
- Automatic token refresh on 401 responses
- No sensitive data stored beyond tokens
- Tokens cleared on logout and errors

### Session Security
- Stateless sessions - no server-side storage
- JWT expiration handled by server validation
- Refresh token rotation on each refresh
- Automatic logout on refresh failures

## Error Handling

### Session Errors

```typescript
// Error scenarios and handling
const handleSessionError = (error: AuthError) => {
  switch (error.type) {
    case 'TOKEN_EXPIRED':
    case 'TOKEN_INVALID':
    case 'REFRESH_FAILED':
      // Clear tokens and redirect to login
      useAuthStore.getState().logout();
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
      break;
      
    case 'NETWORK_ERROR':
      // Don't logout on network errors
      toast.error('Connection error. Please check your internet.');
      break;
      
    default:
      console.error('Unknown auth error:', error);
  }
};
```

---

**Related Documentation:**
- [Email/Password Authentication](./email-password-auth.md)
- [Google OAuth Authentication](./google-oauth-auth.md) 
- [Authentication API Reference](../api/authentication.md)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true; // Invalid token format
    }
  }
}
```

### Automatic Token Refresh

#### Token Refresh Implementation
```typescript
// Simplified token refresh hook without proactive scheduling
export const useTokenRefresh = () => {
  const { tokens, setTokens, logout } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Refresh token function (called on 401 responses)
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) return false;
    
    const storedTokens = SecureTokenStorage.retrieve();
    if (!storedTokens || SecureTokenStorage.isRefreshExpired()) {
      logout();
      return false;
    }
    
    setIsRefreshing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: storedTokens.refreshToken
        })
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const newTokens = await response.json();
      
      // Store new tokens
      SecureTokenStorage.store(newTokens);
      setTokens(newTokens.access_token, newTokens.refresh_token);
      
      return true;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, setTokens, logout]);
  
  return {
    refreshToken,
    isRefreshing
  };
};
```

### Session State Management

#### Auth Store with Session Management
```typescript
// Enhanced auth store with session management
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  lastActivity: number;
  sessionId: string | null;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  lastActivity: Date.now(),
  sessionId: null,
  
  // Initialize session from storage
  initializeAuth: () => {
    const storedTokens = SecureTokenStorage.retrieve();
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedTokens && storedUser && !SecureTokenStorage.isExpired()) {
      set({
        tokens: {
          accessToken: storedTokens.accessToken,
          refreshToken: storedTokens.refreshToken
        },
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        sessionId: generateSessionId()
      });
    }
  },
  
  // Set tokens and update session
  setTokens: (accessToken: string, refreshToken: string) => {
    const tokens = { accessToken, refreshToken };
    
    SecureTokenStorage.store(tokens);
    
    set({
      tokens,
      isAuthenticated: true,
      lastActivity: Date.now(),
      sessionId: generateSessionId()
    });
  },
  
  // Update user data
  setUser: (user: User) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user });
  },
  
  // Update last activity
  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },
  
  // Check session validity
  isSessionValid: (): boolean => {
    const state = get();
    
    if (!state.isAuthenticated || !state.tokens) {
      return false;
    }
    
    // Check inactivity timeout (optional)
    const maxInactivity = 2 * 60 * 60 * 1000; // 2 hours
    if (Date.now() - state.lastActivity > maxInactivity) {
      return false;
    }
    
    return true;
  },
  
  // Logout and clear session
  logout: async () => {
    const state = get();
    
    try {
      // Optionally notify server of logout
      if (state.tokens?.refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.tokens.accessToken}`
          },
          body: JSON.stringify({
            refresh_token: state.tokens.refreshToken
          })
        });
      }
    } catch (error) {
      console.error('Server logout failed:', error);
    }
    
    // Clear all session data
    SecureTokenStorage.clear();
    
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      lastActivity: Date.now(),
      sessionId: null
    });
  }
}));
```

### API Request Interceptor

#### Authenticated Request Handler
```typescript
// Enhanced API client with session management
export class AuthenticatedAPIClient {
  private static instance: AuthenticatedAPIClient;
  
  static getInstance(): AuthenticatedAPIClient {
    if (!this.instance) {
      this.instance = new AuthenticatedAPIClient();
    }
    return this.instance;
  }
  
  // Make authenticated API request
  async request<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const { tokens, isSessionValid, updateActivity, logout } = useAuthStore.getState();
    
    // Check session validity
    if (!isSessionValid()) {
      logout();
      throw new Error('Session expired');
    }
    
    // Add authorization header
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(tokens?.accessToken && {
        'Authorization': `Bearer ${tokens.accessToken}`
      })
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      // Handle authentication errors
      if (response.status === 401) {
        // Try token refresh first
        const refreshSuccess = await this.attemptTokenRefresh();
        
        if (refreshSuccess) {
          // Retry request with new token
          return this.request<T>(url, options);
        } else {
          // Refresh failed, logout user
          logout();
          throw new Error('Authentication required');
        }
      }
      
      // Update activity on successful request
      updateActivity();
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      return response.json();
      
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  // Attempt token refresh
  private async attemptTokenRefresh(): Promise<boolean> {
    const { tokens } = useAuthStore.getState();
    
    if (!tokens?.refreshToken || SecureTokenStorage.isRefreshExpired()) {
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: tokens.refreshToken
        })
      });
      
      if (!response.ok) {
        return false;
      }
      
      const newTokens = await response.json();
      
      // Update stored tokens
      useAuthStore.getState().setTokens(
        newTokens.access_token, 
        newTokens.refresh_token
      );
      
      return true;
      
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = AuthenticatedAPIClient.getInstance();
```

### Session Activity Tracking

#### Activity Monitoring Hook
```typescript
// Session activity tracking
export const useSessionActivity = () => {
  const { updateActivity, isSessionValid, logout } = useAuthStore();
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track user activity
  const trackActivity = useCallback(() => {
    updateActivity();
    
    // Reset inactivity timer
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    // Set new inactivity timer (2 hours)
    activityTimeoutRef.current = setTimeout(() => {
      if (!isSessionValid()) {
        logout();
      }
    }, 2 * 60 * 60 * 1000);
  }, [updateActivity, isSessionValid, logout]);
  
  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });
    
    // Initial activity tracking
    trackActivity();
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [trackActivity]);
  
  return { trackActivity };
};
```

This comprehensive session management documentation covers token lifecycle, security measures, user experience flows, and technical implementation details for maintaining secure, seamless user sessions in the Barback application.
