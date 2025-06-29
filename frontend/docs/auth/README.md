# Authentication Documentation

This folder contains comprehensive documentation for all authentication features in the Barback application.

## Documentation Structure

### Feature-Based Documentation
- **[Email/Password Authentication](./email-password-auth.md)** - Complete flow for email-based login/registration
- **[Google OAuth Authentication](./google-oauth-auth.md)** - Google login integration
- **[Email Verification](./email-verification.md)** - Email verification process and flows
- **[Password Reset](./password-reset.md)** - Password recovery and reset functionality
- **[Session Management](./session-management.md)** - Token handling and session lifecycle

### Cross-Reference Documentation
- **[Authentication API Reference](../api/authentication.md)** - Backend API endpoints
- **[Tech Stack Authentication Flow](../TechStackGuide.md#authentication-flow)** - Implementation strategy

## Authentication Features Overview

Based on the MVP requirements from the Product Definition:

### Supported Authentication Methods
1. **Email/Password Registration and Login** ✅
   - Password reset via email
   - Email verification (mandatory)
   - Role-based access (Owner, Manager, Staff)

2. **Google OAuth Integration** ✅
   - Single sign-on with Google accounts
   - Streamlined registration process

### Security Features
- JWT-based authentication with access/refresh tokens
- Secure password requirements and validation
- Email verification before full access
- Rate limiting on sensitive endpoints
- Role-based access control (RBAC)

### User Experience Priorities
- Mobile-first design for bar environment usage
- Touch-optimized interfaces
- Clear error messaging and validation feedback
- Seamless OAuth integration
- Offline-ready authentication state management

## Integration Points

### Frontend Architecture
- **State Management**: Zustand auth store + localStorage
- **API Integration**: TanStack Query for auth operations
- **Validation**: Zod schemas with React Hook Form
- **UI Components**: shadcn/ui with custom auth layouts

### Backend Integration
- **Token Management**: JWT access (15min) + refresh tokens (7 days)
- **API Authentication**: Bearer token in Authorization header
- **Role Enforcement**: Server-side permission validation
- **Email Services**: Automated verification and reset emails

## Quick Navigation

| Feature | UX Flow | UI Specifications | Technical Implementation |
|---------|---------|-------------------|-------------------------|
| Login | [Email Auth](./email-password-auth.md#login-flow) | [Login UI](./email-password-auth.md#login-page-ui) | [Login API](./email-password-auth.md#login-technical-flow) |
| Registration | [Email Auth](./email-password-auth.md#registration-flow) | [Register UI](./email-password-auth.md#registration-page-ui) | [Register API](./email-password-auth.md#registration-technical-flow) |
| Google OAuth | [OAuth Flow](./google-oauth-auth.md#oauth-flow) | [OAuth UI](./google-oauth-auth.md#google-button-ui) | [OAuth Implementation](./google-oauth-auth.md#technical-implementation) |
| Email Verification | [Verification Flow](./email-verification.md#verification-flow) | [Verification UI](./email-verification.md#verification-pages-ui) | [Verification API](./email-verification.md#technical-implementation) |
| Password Reset | [Reset Flow](./password-reset.md#password-reset-flow) | [Reset UI](./password-reset.md#password-reset-pages-ui) | [Reset API](./password-reset.md#technical-implementation) |
| Session Management | [Session Flow](./session-management.md#session-lifecycle) | [Session UI](./session-management.md#session-ui-states) | [Token Management](./session-management.md#technical-implementation) |
