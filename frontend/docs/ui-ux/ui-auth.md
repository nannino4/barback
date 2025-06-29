# Authentication UI Specifications

## Overview

The authentication system provides secure, user-friendly access to the Barback application with support for email/password authentication and Google OAuth integration.

## Page Structure

### Layout Pattern (All Auth Pages)
```
┌─────────────────────────────────┐
│                                 │ ← Top spacing (10% viewport)
│           🍸 Barback            │ ← Logo & brand (centered)
│      Premium Inventory          │ ← Tagline
│                                 │
│  ┌─────────────────────────┐   │ ← Form container
│  │                         │   │   (max-width: 400px)
│  │       Form Content      │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│     Footer Links/Actions        │ ← Bottom actions
│                                 │ ← Bottom spacing (5% viewport)
└─────────────────────────────────┘
```

## Login Page (`/auth/login`)

### Mobile Layout
```
┌─────────────────────────────────┐
│                                 │
│           🍸 Barback            │
│      Premium Inventory          │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📧 Email                │   │ ← Input with icon
│  │ email@example.com       │   │
│  ├─────────────────────────┤   │
│  │ 🔒 Password             │   │ ← Password input
│  │ ••••••••••••            │   │   with show/hide toggle
│  ├─────────────────────────┤   │
│  │                         │   │
│  │       Sign In           │   │ ← Primary button (gold)
│  │                         │   │   (Full width)
│  └─────────────────────────┘   │
│                                 │
│          ─── OR ───             │ ← Divider
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔍 Continue with Google │   │ ← Google OAuth button
│  └─────────────────────────┘   │   (Secondary style)
│                                 │
│   Forgot password? • Sign up    │ ← Action links
└─────────────────────────────────┘
```

### Components Used
```tsx
// Main login form component
<LoginForm />
├── <Input type="email" icon={Mail} placeholder="Email" />
├── <PasswordInput icon={Lock} placeholder="Password" />
├── <Button variant="primary" size="large">Sign In</Button>
├── <Divider>OR</Divider>
├── <GoogleLoginButton />
└── <AuthLinks>
    ├── <Link to="/auth/forgot-password">Forgot password?</Link>
    └── <Link to="/auth/register">Sign up</Link>
```

### Validation & Error States
```
Email Validation:
- Required field
- Valid email format
- Real-time validation feedback

Password Validation:
- Required field
- Minimum 8 characters
- Show/hide toggle for visibility

Form-level Errors:
- Invalid credentials
- Account not verified
- Account locked
- Network errors
```

## Registration Page (`/auth/register`)

### Mobile Layout
```
┌─────────────────────────────────┐
│           🍸 Barback            │
│      Create Your Account        │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 👤 First Name           │   │
│  ├─────────────────────────┤   │
│  │ 👤 Last Name            │   │
│  ├─────────────────────────┤   │
│  │ 📧 Email                │   │
│  ├─────────────────────────┤   │
│  │ 📱 Phone (Optional)     │   │ ← Italian format hint
│  │ +39 3XX XXX XXXX        │   │
│  ├─────────────────────────┤   │
│  │ 🔒 Password             │   │ ← Password requirements
│  │ ••••••••••••            │   │   shown below
│  ├─────────────────────────┤   │
│  │ 🔒 Confirm Password     │   │ ← Password confirmation
│  │ ••••••••••••            │   │   with match validation
│  ├─────────────────────────┤   │
│  │                         │   │
│  │      Create Account     │   │ ← Primary button
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│          ─── OR ───             │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔍 Continue with Google │   │
│  └─────────────────────────┘   │
│                                 │
│   Already have an account?      │ ← Sign in link
│           Sign in               │
└─────────────────────────────────┘
```

### Password Requirements Display
```
Password Requirements:
✓ At least 8 characters
✓ One uppercase letter
✓ One lowercase letter
✓ One number
✓ One symbol (!@#$%^&*)
```

### Components Used
```tsx
<RegisterForm />
├── <Input name="firstName" icon={User} placeholder="First Name" />
├── <Input name="lastName" icon={User} placeholder="Last Name" />
├── <Input name="email" type="email" icon={Mail} placeholder="Email" />
├── <PhoneInput 
│     name="phoneNumber" 
│     country="IT" 
│     placeholder="+39 3XX XXX XXXX" 
│   />
├── <PasswordInput 
│     name="password" 
│     icon={Lock} 
│     showRequirements={true} 
│   />
├── <PasswordInput 
│     name="confirmPassword" 
│     icon={Lock} 
│     placeholder="Confirm Password"
│     validateMatch={formData.password}
│   />
├── <PasswordRequirements password={formData.password} />
├── <Button variant="primary" size="large">Create Account</Button>
├── <Divider>OR</Divider>
├── <GoogleLoginButton />
└── <AuthLinks>
    └── <Link to="/auth/login">Already have an account? Sign in</Link>
```

### Validation Rules
```
First/Last Name:
- Required fields
- Max 50 characters each
- No special characters

Email:
- Required field
- Valid email format
- Unique check (real-time)

Phone Number:
- Optional field
- Italian format validation (+39 3XX XXX XXXX)
- Real-time formatting

Password:
- Min 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 symbol
- Real-time strength indicator

Confirm Password:
- Required field
- Must match password exactly
- Real-time validation feedback
- At least 1 lowercase letter
- At least 1 number
- At least 1 symbol
- Real-time strength indicator
```

## Email Verification Page (`/auth/verify-email`)

### Layout After Registration
```
┌─────────────────────────────────┐
│           🍸 Barback            │
│                                 │
│         📧 Check Your Email     │
│                                 │
│  We've sent a verification      │
│  link to:                       │
│                                 │
│      user@example.com           │ ← User's email (bold)
│                                 │
│  Click the link in the email    │
│  to verify your account and     │
│  continue to the app.           │
│                                 │
│  ⚠️ You must verify your email  │ ← Required verification notice
│  before you can access Barback. │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Resend Email        │   │ ← Secondary button
│  └─────────────────────────┘   │   (disabled for 60s)
│                                 │
│  Didn't receive it?             │
│  • Check your spam folder       │
│  • Ensure the email is correct  │
│                                 │
│      Change email address       │ ← Link to update email
└─────────────────────────────────┘
```

### Components Used
```tsx
<EmailVerification email={userEmail} />
├── <EmailDisplay email={userEmail} />
├── <VerificationRequiredNotice /> // New component for mandatory verification
├── <ResendButton cooldown={60} />
├── <VerificationTips />
└── <Link to="/auth/change-email">Change email address</Link>
```

## Forgot Password Page (`/auth/forgot-password`)

### Mobile Layout
```
┌─────────────────────────────────┐
│           🍸 Barback            │
│         Reset Password          │
│                                 │
│  Enter your email address and   │
│  we'll send you a link to       │
│  reset your password.           │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 📧 Email                │   │
│  │ email@example.com       │   │
│  ├─────────────────────────┤   │
│  │                         │   │
│  │    Send Reset Link      │   │ ← Primary button
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│     Remember your password?     │
│            Sign in              │ ← Back to login
└─────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────┐
│           🍸 Barback            │
│                                 │
│         📧 Check Your Email     │
│                                 │
│  We've sent password reset      │
│  instructions to:               │
│                                 │
│      user@example.com           │
│                                 │
│  The link will expire in        │
│  15 minutes.                    │
│                                 │
│  ┌─────────────────────────┐   │
│  │     Resend Email        │   │ ← Disabled for 60s
│  └─────────────────────────┘   │
│                                 │
│      Back to Sign In            │
└─────────────────────────────────┘
```

### Components Used
```tsx
<ForgotPasswordForm />
├── <Input name="email" type="email" icon={Mail} placeholder="Email" />
├── <Button variant="primary" size="large">Send Reset Link</Button>
└── <Link to="/auth/login">Remember your password? Sign in</Link>

// Success state
<ForgotPasswordSuccess email={userEmail} />
├── <EmailDisplay email={userEmail} />
├── <ResendButton cooldown={60} />
└── <Link to="/auth/login">Back to Sign In</Link>
```

## Reset Password Page (`/auth/reset-password?token=...`)

### Mobile Layout
```
┌─────────────────────────────────┐
│           🍸 Barback            │
│        Create New Password      │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔒 New Password         │   │
│  │ ••••••••••••            │   │
│  ├─────────────────────────┤   │
│  │ 🔒 Confirm Password     │   │
│  │ ••••••••••••            │   │
│  ├─────────────────────────┤   │
│  │                         │   │
│  │    Update Password      │   │ ← Primary button
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Password Requirements:         │ ← Same as registration
│  ✓ At least 8 characters        │
│  ✓ One uppercase letter         │
│  ✓ One lowercase letter         │
│  ✓ One number                   │
│  ✓ One symbol                   │
└─────────────────────────────────┘
```

### Components Used
```tsx
<ResetPasswordForm token={urlToken} />
├── <PasswordInput 
│     name="password" 
│     icon={Lock} 
│     placeholder="New Password" 
│     showRequirements={true} 
│   />
├── <PasswordInput 
│     name="confirmPassword" 
│     icon={Lock} 
│     placeholder="Confirm Password" 
│   />
├── <PasswordRequirements password={formData.password} />
├── <PasswordMatch 
│     password={formData.password} 
│     confirm={formData.confirmPassword} 
│   />
└── <Button variant="primary" size="large">Update Password</Button>
```

## OAuth Integration (Google)

### Google Login Flow
1. **User clicks** "Continue with Google"
2. **Redirect** to Google OAuth consent
3. **User authorizes** Barback application
4. **Redirect back** to app with authorization code
5. **Exchange code** for tokens on backend
6. **Create/login user** and redirect to dashboard

### Google Button Component
```tsx
<GoogleLoginButton />
// Styled as secondary button with Google branding
// Includes Google logo and proper ARIA labels
// Handles loading states during OAuth flow
```

## Mobile-Specific Considerations

### Touch Interactions
- **All buttons**: Minimum 44px height
- **Input fields**: Large touch targets with adequate spacing
- **Form labels**: Positioned above inputs for thumb accessibility

### Keyboard Behavior
- **Auto-focus**: First input field on page load
- **Tab order**: Logical progression through form elements
- **Return key**: Advances to next field or submits form

### Auto-fill Support
- **Proper autocomplete** attributes for email/password
- **Compatible** with password managers
- **Biometric authentication** support where available

## Error Handling

### Network Errors
```
┌─────────────────────────────────┐
│  ⚠️ Connection Problem          │ ← Toast notification
│  Please check your internet    │
│  connection and try again.     │
│  [Retry] [Dismiss]             │
└─────────────────────────────────┘
```

### Validation Errors
- **Inline validation** with red borders and error text
- **Form submission errors** shown above submit button
- **Clear, actionable** error messages

### Server Errors
- **User-friendly messages** instead of technical errors
- **Retry mechanisms** for temporary failures
- **Support contact** for persistent issues

This authentication system provides a secure, accessible, and user-friendly entry point to the Barback application while maintaining the sophisticated design aesthetic.
