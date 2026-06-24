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
