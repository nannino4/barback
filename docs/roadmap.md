# Barback Roadmap

Barback is in MVP development. This roadmap is the canonical product-level plan
for the monorepo.

## Current MVP focus

- Keep Inventory as the default workspace for every role.
- Finish account-level payment method management.
- Add low-stock alert foundations once product thresholds/par levels are fully
  modeled end-to-end.
- Harden local validation, deployment, and browser/UI review workflows.

## Completed MVP foundation

### Platform

- Backend NestJS API with all routes under `/api`.
- Frontend React/Vite SPA with English and Italian localization.
- Local-only CI/CD scripts for backend, frontend, image publishing, and dev
  deployment.
- Docker Compose dev/staging runtime on a shared EC2 host.

### Authentication and account management

- Email/password registration and login.
- Email verification.
- Password reset.
- Google OAuth login/registration.
- JWT access/refresh token flow with refresh-token rotation.
- User profile management, avatar upload, language, and timezone preferences.

### Organizations and roles

- Multi-organization membership.
- Owner, Manager, and Staff organization roles.
- Organization creation backed by a subscription.
- Invitation send/accept/decline/revoke flows.
- Member role management and member removal/leave flows.

### Billing foundation

- Stripe subscription model.
- 90-day frictionless trial for the first eligible organization.
- Paid yearly subscription path.
- Subscription webhooks and status synchronization.
- Organization-specific subscription payment method assignment.
- Paused trial/subscription resume preview.

### Inventory MVP

- Product CRUD.
- Category CRUD with nested categories.
- Inventory page as operative product list.
- Product detail and stock history views.
- Manual stock adjustments with inventory logs.
- Client-side product search/filtering for MVP scale.

## In progress / next

### Account-level payment settings

- List saved Stripe customer payment methods in the user profile.
- Add new payment method via SetupIntent.
- Set customer-level default payment method.
- Remove payment methods with confirmation.
- When removing a method used by organization subscriptions, show affected
  venues and warn about renewal/pause consequences.

### Alerts and thresholds

- Add/confirm product low-stock threshold fields across backend and frontend.
- Implement low-stock alert model and API.
- Build Alerts route and role-aware alert actions.
- Add email/push notification hooks later.

### Product images

- Preset product image library.
- Custom product image upload using the backend storage service.
- Product image removal.

### Analytics

- Consumption reports from inventory logs.
- Basic filtering by date range, category, and product.

## Deferred / future

### PWA

- Service worker setup.
- Offline inventory viewing.
- Offline stock adjustment queue and sync.
- Web app manifest and install prompt.
- Push notifications.

### Growth features

- Supplier management.
- POS integrations.
- Recipes and cocktail costing.
- Staff shifts/checklists.
- Rich analytics and forecasting.

### Operations

- Production branch/deploy strategy.
- Remote CI may be reintroduced if external contributors, branch protection, or
  stronger auditability become important.
- Terraform remote state with locking before multiple operators use it.

