# Email Service Documentation

This document outlines the email service configuration and implementation for the Barback application.

## Overview

The application uses Nodemailer for email delivery via SMTP with localized templates.

## Email Service Configuration

The application uses Nodemailer for email delivery with the following configuration:

### Development/Testing
- Supports SMTP providers (Ethereal/Gmail/SES/etc.) via `SMTP_*` variables
- Console logging of email content for debugging
- Ethereal preview URL logging when available

### Production Recommendations
- Use AWS SES SMTP for better deliverability
- Configure proper DNS records (SPF, DKIM, DMARC) for email deliverability
- Use localized templates with proper branding (`EMAIL_APP_NAME`)
- Implement email delivery monitoring and failure handling
- Set appropriate production token expiration times

## Environment Variables Setup

```bash
# Email Configuration (SES example)
SMTP_HOST=email-smtp.eu-west-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
EMAIL_FROM=noreply@barback.app
EMAIL_APP_NAME=Barback
FRONTEND_URL=http://localhost:3001

# Email Settings
EMAIL_VERIFICATION_EXPIRY=24h
PASSWORD_RESET_EXPIRY=1h
```

## Email Types

The email service handles the following types of emails:

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
- **SMTP Security**: Uses secure transport with authentication

## Implementation Details

- **Service Location**: `src/email/email.service.ts`
- **Module**: `src/email/email.module.ts`
- **Dependencies**: Nodemailer, NestJS ConfigService
- **Transport**: SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
- **Error Handling**: Comprehensive logging and graceful degradation
- **Testing**: Ethereal Email integration for development testing

## Future Enhancements

- **Advanced Email Templates**: More sophisticated HTML email templates with branding and responsive design
- **Email Rate Limiting**: Implementing rate limiting for email sending to prevent abuse
- **Email Delivery Monitoring**: Track delivery status and implement retry mechanisms
- **Template Engine**: Integration with template engines for dynamic content
- **Email Queue**: Implement background job queue for reliable email delivery
