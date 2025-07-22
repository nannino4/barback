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