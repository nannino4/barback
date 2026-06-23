# Barback Application - MVP Development Roadmap

This document outlines the development tasks for the Minimum Viable Product (MVP) of the Barback application.

## MVP Stage

### Workspace Setup
- [X] Set up NestJS backend project with TypeScript.
- [X] Define product requirements.
- [X] Define coding guidelines.
- [X] Define testing guidelines.
- [X] Configure ESLint and Prettier according to `CodingGuidelines.md`.
- [X] Configure different environments (dev, test, prod).
- [X] Define logging guidelines and configure logging.

### Define Core Data Models
- [X] **User Model**:
  - [X] Define schema (e.g., email, password hash, Google ID, roles).
  - [X] Define roles: Admin, User.
- [X] **Organization Model**:
  - [X] Define schema (e.g., name, owner, single inventory per organization).
  - [X] Define org related user roles: Owner, Manager, Staff.
- [X] **Subscription Model**:
  - [X] Define schema.
- [X] **Product Model**:
  - [X] Define schema (e.g., name, category link, unit of measure, par level).
- [X] **Category Model**:
  - [X] Define schema (e.g., name, description) for product categorization.
- [X] **Inventory Model**:
  - [X] Define schema for current stock levels integrated into Product model.
  - [X] Define schema for inventory logs (stock adjustments, reason codes, timestamp, user).
- [X] **Alerts Model**:
  - [X] Define schema (e.g., type - low stock/reminder, target - product/task, threshold, status).

### Features

#### Authentication & Authorization
- [X] **User Session Strategy**:
  - [X] Define and implement user session management (e.g., JWT-based).
- [X] **Email/Password Authentication**:
  - [X] Implement User Registration with email and password.
  - [X] Implement Email verification for new accounts
  - [X] Implement User Login with email and password.
  - [X] Implement Password reset functionality via email
- [X] **Google OAuth Authentication**:
  - [X] Implement User Registration with Google OAuth
  - [X] Implement User Login with Google OAuth
- [X] **UserRole-Based Access Control (RBAC)**:
  - [X] Implement guards for UserRoles.
- [X] **User Account Management (Admin)**:
  - [X] Implement Admin functionality to list all users.
  - [X] Implement Admin functionality to view individual user details.
  - [X] Implement Admin functionality to update user profile information.
  - [X] Implement Admin functionality to manage user roles (e.g., assign/revoke Admin role).
  - [X] Implement Admin functionality to manage user account status (e.g., activate/deactivate).
  - [X] Implement Admin functionality to delete user accounts (consider soft delete).
  - [X] Develop API endpoints for these admin user management operations (e.g., under `/admin/users`).
- [X] **User Profile Management (User-Self)**:
  - [X] Allow users to view their own profile information.
  - [X] Allow users to update their own profile information (e.g., name, contact details - excluding email/password which are handled separately).
  - [X] Allow users to change their password (after verifying current password).
  - [X] Allow users to delete their own account (consider implications and data retention policies).
  - [X] Develop API endpoints for these user profile management operations (e.g., under `/users/me`).
  - [ ] **Future Enhancements**:
    - [ ] Implement session invalidation on password change (security improvement)
    - [ ] Implement soft delete for user accounts (mark inactive instead of hard delete)
    - [ ] Add hard delete endpoint for admin use only
    - [ ] Add PII (Personally Identifiable Information) logging policy and audit
    - [X] **Implement profile picture upload**:
      - [X] Integrate with cloud storage service (e.g., Google Cloud Storage, AWS S3, Cloudinary)
      - [X] Create API endpoint for profile picture upload
      - [X] Handle image processing (resize, format conversion)
      - [X] Update User model to store profile picture URL
      - [X] Store both full and thumbnail URLs for optimization
  - [ ] **Account Deletion Business Logic** (planned for post-MVP):
    - Organizations keep existing when sole owner deletes account
    - Subscriptions auto-cancel on renewal (not immediately)
    - No grace period for account recovery (immediate soft delete)
    - Consider implementing transfer ownership flow before allowing deletion

#### Email Verification Access Control
Unified guard now restricts authenticated operations until email is verified. Explicit controller-level composition used instead of global `APP_GUARD` for clarity.

- [X] **Implement `EmailVerifiedGuard`**:
  - [X] Guard checks `request.user.isEmailVerified` and throws `EmailNotVerifiedException` (`EMAIL_NOT_VERIFIED`).
  - [X] Standard payload: `{ statusCode: 403, error: 'EMAIL_NOT_VERIFIED', message: 'Email must be verified to access this resource.' }`.
- [X] **Skip Decorator**:
  - [X] `@SkipEmailVerification()` created with `SKIP_EMAIL_VERIFICATION_KEY` metadata constant.
- [X] **Registration Strategy**:
  - [X] Added explicitly to protected controllers immediately after `JwtAuthGuard` (not using global `APP_GUARD`).
  - [X] Ensures no impact to public controllers/endpoints.
- [X] **Add Error Documentation**:
  - [X] Add shared snippet to API docs referencing 403 response & requirement rationale.
- [X] **Testing (Unit)**:
  - [X] Guard unit tests added (`email-verified.guard.spec.ts`).

#### Timezone Management
- [X] **User Timezone Preference**:
  - [X] Add `timezone` field to user profile (IANA timezone string | "auto")
  - [X] Expose `timezone` in user profile read/update endpoints
  - [X] Validate timezone against IANA list on update
- [X] **UTC-Only Storage**:
  - [X] Ensure all persisted timestamps are stored in UTC
  
#### Subscription Management
- [X] **Stripe Setup**:
  - [X] Set up Stripe account and configure API keys.
  - [X] Install Stripe SDK and implement webhook handling.
- [X] **Core Subscription Models**:
  - [X] Implement CRUD operations for Subscription model.
  - [X] Define 90-day trial and yearly Basic plan configurations.
- [X] **Subscription Lifecycle**:
  - [X] Create trial subscriptions for organization owners only (not automatic for all users).
  - [X] Implement frictionless trial activation without collecting a card up front.
  - [X] Configure trial-end behavior to pause when no payment method is available.
  - [X] Implement automatic Trial → Basic conversion at trial end when a payment method is assigned.
  - [X] Sync billing status with Stripe webhooks (active, trialing, paused, past_due, canceled).
  - [X] Implement subscription cancellation foundation.
  - [X] Implement paused subscription reactivation by assigning a payment method.
  - [X] Add resume invoice preview so the frontend can show due-now amount and recurring period before reactivation.
- [X] **Payment Methods**:
  - [X] Allow users to add/list/remove payment methods via Stripe.
  - [X] Implement customer-level default payment method selection.
  - [X] Allow each organization subscription to use a specific payment method (`subscription.default_payment_method`).
  - [X] Include current subscription payment method in owner subscription responses.
- [X] **Access Control**:
  - [X] Implement subscription-based access control (`OrgSubscriptionGuard`).
  - [X] Restrict organization features to active/trialing subscriptions.
  - [X] Block organization creation for clearly failed subscription states.
- [X] **API Endpoints**:
  - [X] `POST /api/subscriptions/trial` - Activate frictionless trial.
  - [X] `POST /api/subscriptions` - Set up paid subscription payment.
  - [X] `GET /api/subscriptions/trial-eligibility` - Check trial eligibility.
  - [X] `GET /api/subscriptions/:id/resume-preview` - Preview due-now amount when resuming a paused subscription.
  - [X] `POST /api/subscriptions/:id/payment-method` - Assign payment method to a subscription and resume if paused.
  - [X] `GET /api/payment/methods` - List saved payment methods.
  - [X] `POST /api/payment/setup-intent` - Create SetupIntent for adding a card.
  - [X] `POST /api/payment/methods` - Register a new payment method.
  - [X] `POST /api/payment/methods/default` - Set customer default payment method.
  - [X] `DELETE /api/payment/methods/:paymentMethodId` - Remove a payment method.
  - [X] `POST /api/webhooks/stripe` - Handle Stripe events.
- [ ] **Planned: Personal Payment Settings Support**:
  - [ ] Return which organization subscriptions use each payment method.
  - [ ] When deleting a payment method, allow deletion after warning about affected subscriptions.
  - [ ] Clear or update affected subscription default payment methods after deletion.
  - [ ] Document behavior: renewals may fail, subscriptions may become `past_due`, or trial-end subscriptions may pause if no valid fallback/default method exists.
- [ ] **Email Notifications**:
  - [X] Trial ending reminder from Stripe `customer.subscription.trial_will_end` webhook.
  - [ ] Additional trial expiration reminders (7-day, 1-day) if needed.
  - [ ] Automatic billing activation notification when trial ends.
  - [ ] Payment failure notifications.
- [ ] Handle failed payments and retries
  - [ ] Model "requires action" / SCA state where applicable.
  - [ ] Add customer-facing recovery flow for failed renewals.

**📋 Deployment Checklist:**
- [ ] Set up actual Stripe account and get production API keys
- [X] Create Stripe products and pricing plans
- [ ] Configure webhook endpoints in Stripe dashboard
- [ ] Test subscription flow end-to-end
- [ ] Deploy to production environment

#### Organization Management
**✅ Basic Organization Management COMPLETED**
- Depends on: Subscription Management (✅ Completed)
- Integration: Uses `ActiveSubscriptionGuard` to restrict organization creation
- [X] **Basic Organization API Endpoints**:
  - [X] `GET /api/orgs` - List all organizations user is in (optional filter by orgRole)
  - [X] `GET /api/orgs/{id}/members` - List organization members
  - [X] `POST /api/orgs` - Create organization
  - [X] `PUT /api/orgs/{id}` - Update organization name/settings (owner only)
  - [X] `PUT /api/orgs/{id}/members/{userId}/role` - Update member role (owners/managers only)
- [X] **Role-Based Access Control**:
  - [X] Implement `OrgRolesGuard` for organization-level permissions
  - [X] Prevent owner role assignment through role updates
- [X] **Data Models & Schemas**:
  - [X] Organization schema with proper indexing
  - [X] UserOrgRelationship schema
  - [X] OrgInvite schema
  - [X] Input/Output DTOs with proper validation and transformation
- [X] **Organization Invitation System**:
  - [X] Implement invitation token generation and validation logic
  - [X] Handle invitation acceptance for existing and new users
- [X] **Invitation API Endpoints**:
  - [X] `GET /invitations` - List user's pending invitations
  - [X] `POST /api/orgs/{id}/invites` - Send organization invitation
  - [X] `POST /invitations/accept/{token}` - Accept invitation (logged-in users)
  - [X] `POST /invitations/decline/{token}` - Decline invitation (logged-in users)
  - [X] `POST /public/invitations/accept/{token}` - Accept invitation (anonymous users)
  - [X] `POST /public/invitations/decline/{token}` - Decline invitation (anonymous users)
  - [X] `GET /public/invitations/details/{token}` - Get invitation details
  - [X] `DELETE /api/orgs/{id}/invites/{invitationId}` - Revoke invitation
- [X] **Invitation Data Enhancement**:
  - [X] Update `GET /invitations` to return populated data (organization name, inviter name) instead of just IDs
  - [X] Create OutInvitationPopulatedDto with nested organization and user objects
  - [X] Update `GET /api/orgs/{id}/invitations` to return populated inviter data
  - [X] Frontend can now display user-friendly invitation information without additional API calls
- [X] **Missing Organization Endpoint**:
  - [X] Add `GET /api/orgs/:id` endpoint to fetch single organization by ID
  - [X] Includes proper authorization (any member can view)
  - [X] Returns complete organization details with settings
- [X] **Organization Member Management** (Required for Org Management UI):
  - [X] `POST /api/orgs/{id}/leave` - Leave organization (non-owner members)
    - Prevent owner from leaving (must transfer ownership first)
    - Remove user from organization membership
    - Return success confirmation
  - [X] `DELETE /api/orgs/{id}/members/{userId}` - Remove member from organization
    - Owner/manager only
    - Prevent removing the owner
    - Prevent removing self (use leave endpoint instead)

#### Category Management
- [X] **Data Layer Setup**:
  - [X] Create Category Mongoose schema with validation and indexes
  - [X] Create Category DTOs (CreateCategoryDto, UpdateCategoryDto, CategoryDto)
- [X] **Service Implementation**:
  - [X] Implement CategoryService with CRUD operations and hierarchy validation
  - [X] Add business logic for preventing circular references and handling deletions
- [X] **API Endpoints**:
  - [X] `GET /api/orgs/:orgId/categories` - List categories (with optional tree structure)
  - [X] `GET /api/orgs/:orgId/categories/:id` - Get single category
  - [X] `POST /api/orgs/:orgId/categories` - Create category (owners/managers only)
  - [X] `PUT /api/orgs/:orgId/categories/:id` - Update category (owners/managers only)
  - [X] `DELETE /api/orgs/:orgId/categories/:id` - Delete category (owners/managers only)
- [X] **Access Control**:
  - [X] Extend OrgRolesGuard to restrict create/update/delete to owners and managers
  - [X] Ensure all operations are scoped to user's organization

#### Product Management
- [X] **Data Layer Setup**:
  - [X] Create Product Mongoose schema with category linking and validation
  - [X] Create Product DTOs (CreateProductDto, UpdateProductDto, ProductDto)
- [X] **Service Implementation**:
  - [X] Implement ProductService with CRUD operations and category validation
  - [X] Add business logic for stock quantity tracking and category assignments
- [X] **API Endpoints**:
  - [X] `GET /api/orgs/:orgId/products` - List products (with category filtering)
  - [X] `GET /api/orgs/:orgId/products/:id` - Get single product
  - [X] `POST /api/orgs/:orgId/products` - Create product
  - [X] `PUT /api/orgs/:orgId/products/:id` - Update product
  - [X] `DELETE /api/orgs/:orgId/products/:id` - Delete product
- [ ] **Product Images**:
  - [ ] **Preset Images**:
    - [ ] Upload preset product images to cloud storage (organized by category: spirits, wine, beer, mixers, other)
    - [ ] Create API endpoint to list available preset images: `GET /api/preset-images`
    - [ ] Return preset image URLs that can be stored directly in Product `imageUrl` field
  - [ ] **Custom Image Upload**:
    - [ ] Create endpoint to upload custom product image: `POST /api/orgs/:orgId/products/:productId/image`
    - [ ] Reuse existing storage service (same as profile picture upload)
    - [ ] Handle image processing (resize, format conversion)
    - [ ] Update product `imageUrl` field with uploaded image URL
    - [ ] Create endpoint to remove product image: `DELETE /api/orgs/:orgId/products/:productId/image`
  - [ ] **Image Strategy**:
    - [ ] User can choose preset image (stored as URL in `imageUrl`)
    - [ ] User can upload custom image (requires product to be created first, then upload)
    - [ ] Keep existing `imageUrl` field in Product schema (no `imageId` needed)

#### Inventory Management
- [X] **Data Layer Setup**:
  - [X] Create InventoryLog Mongoose schema for tracking stock changes
  - [X] Create inventory DTOs (StockAdjustmentDto, InventoryReportDto)
- [X] **Service Implementation**:
  - [X] Implement manual stock adjustments with reason codes and logging
  - [X] Implement inventory report generation by date range and snapshots
- [X] **API Endpoints**:
  - [X] `POST /api/orgs/:orgId/products/:productId/adjust-stock` - Manual stock adjustment
  - [X] `GET /api/orgs/:orgId/products/:productId/logs` - Get product inventory history

#### Alerts & Notifications
- [ ] **Data Layer Setup**:
  - [ ] Create Alert Mongoose schema for low stock and scheduled alerts
  - [ ] Create alert DTOs (CreateAlertDto, UpdateAlertDto, AlertDto)
- [ ] **Service Implementation**:
  - [ ] Implement alert trigger system for low stock detection
  - [ ] Implement time-based reminder scheduling and execution
  - [ ] Integrate email service for alert notifications
- [ ] **API Endpoints**:
  - [ ] `GET /api/orgs/:orgId/alerts` - List organization alerts
  - [ ] `POST /api/orgs/:orgId/alerts` - Create new alert
  - [ ] `PUT /api/orgs/:orgId/alerts/:id` - Update alert configuration
  - [ ] `DELETE /api/orgs/:orgId/alerts/:id` - Delete alert

#### Analytics (Basic MVP)
- [ ] **Service Implementation**:
  - [ ] Implement consumption tracking from inventory logs
  - [ ] Create analytics service for consumption reports by time period, category, and product
- [ ] **API Endpoints**:
  - [ ] `GET /api/orgs/:orgId/analytics/consumption?category=mycategory&productId=myproductid` - Product consumption by time period, category and product

#### Error Handling
- [ ] Always use custon excpetions
- [ ] Use error codes and error messages that the frontend can use to display localized user-friendly messages

#### Database Transactions & Data Consistency
- [X] **High Priority Transactions** (Critical for data integrity):
  - [X] Stock adjustments with inventory log creation (atomically update product quantity and create audit log)
  - [X] Organization creation with owner relationship (prevent orphaned organizations)
- [ ] **Transaction Testing**:
  - [ ] Integration tests for organization creation transactions
  - [ ] Integration tests for stock adjustment transactions

**📋 MongoDB Requirements:**
- [ ] Configure connection pool settings for optimal transaction performance

#### Rate Limiting
  - [X] Install `@nestjs/throttler` package
  - [X] Configure `ThrottlerModule` in app.module
  - [X] Apply rate limits to critical authentication endpoints:
    - [X] `POST /auth/register/email` (3 per 5 minutes)
    - [X] `POST /auth/login/email` (5 per minute)
    - [X] `POST /auth/send-verification-email` (3 per minute) - Now requires authentication
    - [X] `POST /auth/forgot-password` (3 per minute)
  - [X] Update `send-verification-email` to require authentication (prevents email bombing)
  - [X] Fix logger injection using APP_FILTER provider token
  - [X] Add rate limit response headers (X-RateLimit-Limit, Retry-After, etc.)
  - [X] Simplify TTL configuration to use seconds instead of milliseconds
  - [X] Write integration tests for rate limiting
  - [X] Create comprehensive API documentation for rate limiting
  - [X] Test rate limiting manually
  - [ ] (Optional - Future) Consider Redis storage for distributed systems


### Tests
- [ ] Fix timeouts in integration tests (probably linked to mongodb memory server setup)
- [ ] standardize tests. Determine best practices.

### Extra
- [ ] Localize email templates

---
This roadmap will be updated as development progresses.
