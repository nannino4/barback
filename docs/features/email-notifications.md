# Email and Notifications

Barback sends localized transactional email for account verification, password
reset, and invitations. Billing and inventory notification coverage will expand
as the product matures.

## Transactional email types

Current/foundation email types:

- email verification;
- password reset;
- organization invitation;
- trial-ending reminder from Stripe webhook handling;
- future billing failure and low-stock/reminder emails.

Emails should be localized using the user's language preference where available,
with Italian as the default fallback.

## Delivery strategy

The deployed dev environment uses the AWS SES API in `eu-south-1`.

Reasons:

- the AWS account has SES production access there;
- `barback.it` is verified there;
- `eu-south-1` does not expose an SES SMTP endpoint.

SMTP remains supported for local/test providers such as Ethereal or Mailpit.

## Backend configuration

SES API:

```env
EMAIL_TRANSPORT=ses
SES_REGION=eu-south-1
SES_ACCESS_KEY_ID=...
SES_SECRET_ACCESS_KEY=...
EMAIL_FROM=noreply@barback.it
EMAIL_APP_NAME=Barback
FRONTEND_URL=https://barback.it
```

SMTP:

```env
EMAIL_TRANSPORT=smtp
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=noreply@barback.it
EMAIL_APP_NAME=Barback
FRONTEND_URL=http://localhost:5173
```

## Security expectations

- Email verification and password reset tokens are cryptographically random.
- Tokens are one-time use and expire.
- Password reset requests do not reveal whether an email exists.
- Email sends are rate limited where abuse is plausible.
- Email sending failures should not corrupt account state.
- Runtime credentials must live in secret env files and never in Git.

## Operations

- SES/domain operations: `docs/operations/aws-ses.md`
- Secrets workflow: `docs/operations/secrets.md`
- Backend implementation: `backend/docs/email-implementation.md`
