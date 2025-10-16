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