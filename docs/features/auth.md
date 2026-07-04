# Authentication and Sessions

Barback supports email/password auth, Google OAuth, email verification, password
reset, and stateless JWT sessions.

## Auth methods

- Email/password registration and login.
- Google OAuth registration/login.
- Password reset via email.
- Mandatory email verification before organization features are available.

## Token model

The backend uses stateless JWT authentication without Passport.js.

### Access token

- Purpose: authorize protected API requests.
- Sent as `Authorization: Bearer <token>`.
- Short-lived.
- Payload includes `sub`, `email`, user role, and `type: 'access'`.
- Signed with `JWT_ACCESS_TOKEN_SECRET`.

### Refresh token

- Purpose: obtain a new access token after expiration.
- Sent to `/api/auth/refresh-token`.
- Longer-lived.
- Payload includes `sub` and `type: 'refresh'`.
- Signed with `JWT_REFRESH_TOKEN_SECRET`.
- Rotated on use; the client must store the new refresh token returned by the
  refresh endpoint.

## Session lifecycle

1. Successful login/registration returns access and refresh tokens.
2. Frontend stores tokens through `AuthTokenManager`.
3. API requests include the access token.
4. On `401`, the client attempts refresh once, stores rotated tokens, and retries
   the original request.
5. If refresh fails or tokens are missing, tokens are cleared and the user is
   redirected to login.
6. Logout clears local tokens and redirects to login.

There is no server-side session store.

## Email/password flow

Registration:

1. User submits email, password, first name, last name, and optional profile
   fields.
2. Backend creates the user with a hashed password.
3. Backend generates and sends an email verification token.
4. User receives tokens but must verify email before accessing organization
   features.
5. Frontend redirects to the email verification-required experience.

Login:

1. User submits email/password.
2. Backend validates credentials.
3. Backend returns access and refresh tokens.
4. Frontend loads the profile and redirects to the inventory/org flow.
5. Unverified users are routed to verification guidance.

## Email verification

- Verification emails are sent automatically after registration.
- Users can request another verification email from the verification screen.
- Tokens are cryptographically random, one-time use, and expire after the
  configured duration.
- `EmailVerifiedGuard` blocks authenticated organization operations until
  `request.user.isEmailVerified` is true.
- Public/auth endpoints use explicit skip behavior where appropriate.

## Password reset

1. User requests reset with their email.
2. Backend always returns a generic success response to avoid email enumeration.
3. If the account exists and supports password auth, backend sends a reset email.
4. User opens the reset link and submits a new password.
5. Backend validates the one-time token, updates the password hash, clears the
   token, and requires the user to login again.

## Google OAuth flow

1. Frontend requests a Google authorization URL from the backend.
2. Backend returns a URL with a signed OAuth state JWT.
3. User authorizes with Google.
4. Google redirects to the frontend callback route with code and state.
5. Frontend sends code/state to the backend callback endpoint.
6. Backend validates state, exchanges the code, fetches the Google profile, and
   creates or links the Barback user.
7. Backend returns Barback access and refresh tokens.

Google accounts are considered email-verified because Google verifies email
ownership.

## Account linking

- New Google user: create a Google-backed account.
- Existing email/password user with same email: link Google credentials to the
  existing account.
- Existing Google user: update profile details and authenticate normally.
- Duplicate accounts should be prevented by email matching/linking rules.

## Security decisions

- Separate JWT secrets for access, refresh, and OAuth state tokens.
- Explicit token `type` checks prevent refresh tokens from being used as access
  tokens.
- OAuth state is stateless but signed and short-lived.
- Password reset and email verification tokens are one-time use.
- Verification and reset sends are rate limited.
- Email sending failures should degrade gracefully where appropriate.

## Important backend endpoints

Examples include:

- `POST /api/auth/register/email`
- `POST /api/auth/login/email`
- `POST /api/auth/refresh-token`
- `POST /api/auth/send-verification-email`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/oauth/google`
- `POST /api/auth/oauth/google/callback`

Confirm exact request/response DTOs in backend code before changing clients.

## Implementation references

- Backend implementation: `backend/docs/auth-implementation.md`
- Frontend routes, guards, stores, and token manager: `frontend/src/`
- Frontend coding conventions: `frontend/docs/CodingGuidelines.md`
