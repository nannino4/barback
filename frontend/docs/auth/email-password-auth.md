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
3. Email → Real-time validation + uniqueness check
4. Password → Real-time strength indicator
5. Confirm Password → Real-time match validation
6. Submit → Full form validation

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
│  │  Password             │   │
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

#### Implementation Notes
The registration form is implemented using:
- **shadcn/ui Card component** for the container structure
- **React Hook Form** with Zod validation for form handling
- **Grid layout** for name fields (first/last name side-by-side)
- **Password visibility toggles** for both password fields
- **Real-time validation** with error messages
- **Responsive design** optimized for mobile-first usage

Key features implemented:
- Auto-complete attributes for better UX
- Touch-friendly button heights (44px minimum)
- Accessible form labels and error messaging
- Loading states during form submission

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

#### Implementation Notes
The login form is implemented using:
- **shadcn/ui Card component** for the container structure
- **React Hook Form** with Zod validation for form handling
- **Password visibility toggle** for better UX
- **Google OAuth integration** (button component)
- **Responsive design** optimized for mobile-first usage

Key features implemented:
- Auto-complete and auto-focus attributes
- Touch-friendly interactions
- Accessible form labels and error messaging
- Loading states during authentication
- Footer navigation links (forgot password, sign up)

This documentation provides a comprehensive guide to email/password authentication user experience flows and UI specifications for the Barback application.
