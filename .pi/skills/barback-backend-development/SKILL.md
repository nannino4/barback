---
name: barback-backend-development
description: Backend development workflow for Barback. Use when modifying NestJS API code, schemas, DTOs, guards, services, controllers, auth, subscriptions, organizations, products, categories, storage, email, or backend tests.
---

# Barback Backend Development

Use this skill for changes under `backend/`.

## First steps

1. Read the relevant existing module before editing: controller, service, DTOs,
   schemas, tests.
2. Keep business logic in services; controllers stay thin.
3. Preserve the guard layering model:
   - `JwtAuthGuard`
   - `EmailVerifiedGuard`
   - `UserRolesGuard` + `@UserRoles()`
   - `OrgRolesGuard` + `@OrgRoles(...)`
   - `OrgSubscriptionGuard`
4. Treat `UserOrgRelation` as the source of truth for organization membership
   and org roles.

## Code conventions

- Use Allman braces and 4-space indentation.
- Use `const` by default; avoid `any`.
- DTO files are named `in.*.dto.ts` and `out.*.dto.ts`.
- DTO fields use optional `?`, never `| null`.
- Validation messages are i18n translation keys, not English prose.
- Use Nest validation decorators and the global validation pipe behavior.
- Use custom/domain exceptions where the existing codebase has one.

## Logging

- Include request/correlation context in logs.
- Log start and end of important service methods.
- Pass context as the second logger argument, e.g.
  `this.logger.debug('...', 'ProductService#createProduct')`.

## Testing

Default automated tests should be deterministic and local:

```bash
cd backend
npm run test
npm run test -- src/auth/auth.service.spec.ts
npm run test -- src/auth/auth.service.spec.ts -t "test name"
```

- Use `mongodb-memory-server` for database behavior.
- Jest runs in-band to reduce memory-server flakiness.
- Mock third-party network services in the default suite.
- Real Stripe/SES/S3/OAuth checks should be explicit opt-in contract checks.
- Assert on persisted state by querying the database, not on internal calls.

## Validation before final response

For focused backend work, run the narrow relevant tests. Before publishing or
merging backend changes, run:

```bash
cd backend
bash scripts/ci-local.sh
```

Reference docs:

- `docs/product.md`
- `docs/features/auth.md`
- `docs/features/email-notifications.md`
- `backend/docs/CodingGuidelines.md`
- `backend/docs/TestingGuidelines.md`
- `backend/docs/auth-implementation.md`
- `backend/docs/email-implementation.md`
