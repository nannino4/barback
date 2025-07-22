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