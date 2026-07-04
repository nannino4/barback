# Email Service Documentation

This document outlines the email service configuration and implementation for the Barback application.

## Overview

The application sends localized transactional emails for account verification,
password resets, and invitations.

The deployed `dev` environment uses the AWS SES API in `eu-south-1` because the
AWS account already has SES production access there and `barback.it` is verified
there. `eu-south-1` does not expose an SES SMTP endpoint, so deployed email does
not use SES SMTP.

SMTP remains supported for local/testing providers such as Ethereal or Mailpit.

## Email Service Configuration

Select the transport with `EMAIL_TRANSPORT`:

- `EMAIL_TRANSPORT=ses` — AWS SES API, used by deployed environments.
- `EMAIL_TRANSPORT=smtp` — SMTP, useful for local test inboxes.

### SES API configuration

```bash
EMAIL_TRANSPORT=ses
SES_REGION=eu-south-1
SES_ACCESS_KEY_ID=your-ses-api-access-key
SES_SECRET_ACCESS_KEY=your-ses-api-secret-key
EMAIL_FROM=noreply@barback.it
EMAIL_APP_NAME=Barback
FRONTEND_URL=https://barback.it
```

### SMTP configuration

`SMTP_*` values are required only when `EMAIL_TRANSPORT=smtp`.

```bash
EMAIL_TRANSPORT=smtp
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@barback.it
EMAIL_APP_NAME=Barback
FRONTEND_URL=http://localhost:3001
```

## Secrets and deployment

Runtime AWS email credentials are managed by Terraform in `deploy/terraform` and
written to gitignored files under `deploy/secrets/`. See
`docs/operations/secrets.md` for the full secret workflow and EC2 copy steps.

Sensitive files that must not be committed include:

- `deploy/secrets/backend.dev.env`
- `deploy/secrets/backend.dev.aws.generated.env`
- `deploy/terraform/terraform.tfstate`
- `deploy/terraform/terraform.tfvars`

## DNS and SES identity

The active SES identity is `barback.it` in `eu-south-1`. Terraform manages:

- SES domain identity
- SES Easy DKIM CNAME records
- custom MAIL FROM domain `mail.barback.it`
- `_dmarc.barback.it`

Validate with:

```bash
deploy/terraform/check-ses-domain.sh barback-terraform eu-south-1 barback.it
```

Expected state:

- `VerifiedForSendingStatus: true`
- DKIM status: `SUCCESS`
- MAIL FROM status: `SUCCESS`

## Email Types

### 1. Email Verification

- **Purpose**: Verify user email addresses during registration
- **Template**: Professional branded HTML template with CTA + fallback URL
- **Localization**: English and Italian (`user.language` based, default fallback `it`)
- **Expiration**: 24 hours (configurable via `EMAIL_VERIFICATION_EXPIRY`)
- **Security**: Cryptographically secure random tokens

### 2. Password Reset

- **Purpose**: Allow users to reset forgotten passwords
- **Template**: Professional branded HTML template with CTA + fallback URL
- **Localization**: English and Italian (`user.language` based, default fallback `it`)
- **Expiration**: 1 hour (configurable via `PASSWORD_RESET_EXPIRY`)
- **Security**: One-time use tokens with short expiration

## Security Considerations

- **Secure Token Generation**: Uses `crypto.randomBytes(32)` for cryptographically secure tokens
- **Token Expiration**: All email tokens have configurable expiration times
- **One-time Use**: Tokens are cleared after successful use
- **Graceful Failure**: Email sending failures don't break the authentication flow
- **SES permissions**: Runtime email IAM user is scoped to sending from the `barback.it` SES identity

## Implementation Details

- **Service Location**: `src/email/email.service.ts`
- **Module**: `src/email/email.module.ts`
- **Dependencies**: `@aws-sdk/client-ses`, Nodemailer, NestJS ConfigService
- **Transports**: SES API or SMTP selected by `EMAIL_TRANSPORT`
- **Error Handling**: Comprehensive logging and graceful degradation
- **Testing**: SES simulator helper script and SMTP unit tests

## Validate SES sending

From the repository root:

```bash
set -a
. deploy/secrets/backend.dev.aws.generated.env
set +a
cd backend
npm run email:test-ses
```

The helper sends to `success@simulator.amazonses.com` by default. To test a real
recipient, set `SES_TEST_TO=<email>`.

## Future Enhancements

- **Email Delivery Monitoring**: Track delivery status and implement retry mechanisms
- **Template Engine**: Integration with template engines for dynamic content
- **Email Queue**: Implement background job queue for reliable email delivery
- **Advanced Email Templates**: More sophisticated HTML email templates with branding and responsive design
