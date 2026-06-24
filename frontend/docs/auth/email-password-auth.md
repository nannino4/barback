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
3. Email → Real-time validation
4. Password → Real-time strength indicator
5. Confirm Password → Real-time match validation
6. Submit → Full form validation

Validation Timing:
- On Blur: Field-level validation
- On Change: Password strength, email format
- On Submit: Complete form validation
- Real-time: password match
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
   └── Unverified Email → Verification page redirect
   ↓
5. Dashboard Access (with role-based permissions)
```

#### Login Form Interaction Flow
```
Field Entry:
1. Email → Format validation on blur
2. Password → Show/hide toggle available
3. "Sign In" → Form submission

Error Handling:
- Invalid credentials → Clear, actionable message
- Rate limiting → Cooldown period display
- Network errors → Retry mechanism
```
