# Architecture Overview

Barback is a monorepo containing a NestJS API, a React/Vite SPA, and a Docker
Compose deployment stack for the shared dev environment.

## Repository layout

```text
backend/   NestJS + MongoDB API. All routes are prefixed with /api.
frontend/  React 19 + Vite + TypeScript SPA.
deploy/    Docker Compose runtime files, Nginx, Terraform, and ops helpers.
scripts/   Root-level local validation helpers.
.pi/       Agent workflow skills.
docs/      Product, architecture, feature, CI/CD, and operations docs.
```

## Runtime model

### Local

- Frontend: Vite dev server at `https://barback.it:5173`.
- Backend: NestJS dev server at `http://localhost:3000/api`.
- Vite proxies `/api` to the backend.
- Database: MongoDB Atlas by default via `.env.dev`; local MongoDB is optional.
- TLS: local certificates for `barback.it`.

### Shared dev

- Single EC2 host.
- Docker Compose runtime.
- Nginx terminates TLS and reverse proxies API traffic.
- Frontend static assets are served from the frontend Docker image/Nginx setup.
- Backend runs as a Docker container.
- MongoDB Atlas is used for persistence.
- Let’s Encrypt/certbot handles TLS certificates and renewals.
- Docker Hub stores published backend/frontend images.

## Backend architecture

- NestJS modules grouped by feature under `backend/src/<feature>/`.
- Mongoose schemas for MongoDB persistence.
- Thin controllers; business logic in services.
- Guard-based auth/authorization layering:
  - `JwtAuthGuard`
  - `EmailVerifiedGuard`
  - `UserRolesGuard` + `@UserRoles()`
  - `OrgRolesGuard` + `@OrgRoles(...)`
  - `OrgSubscriptionGuard`
- `UserOrgRelation` is the source of truth for organization membership and
  organization roles.
- DTO files indicate direction with `in.*.dto.ts` and `out.*.dto.ts`.

## Frontend architecture

- React Router routes come from `src/constants/routes.ts`.
- Route access composes guards: authenticated → email verified → organization
  selected.
- Server state uses TanStack Query hooks in `src/hooks/` wrapping typed clients
  in `src/api/`.
- API contracts are validated with Zod schemas in `src/types/<domain>.ts`.
- Client state uses Zustand stores in `src/stores/`.
- JWTs are stored in localStorage through `AuthTokenManager`.
- UI uses Tailwind CSS with OKLCH CSS-variable theme tokens and shadcn/Radix
  style components.

## Key feature docs

- Product definition: `docs/product.md`
- Auth: `docs/features/auth.md`
- Organizations: `docs/features/organizations.md`
- Subscriptions and billing: `docs/features/subscriptions-billing.md`
- Inventory: `docs/features/inventory.md`
- Email/notifications: `docs/features/email-notifications.md`

## Implementation references

- Backend coding: `backend/docs/CodingGuidelines.md`
- Backend testing: `backend/docs/TestingGuidelines.md`
- Backend auth implementation: `backend/docs/auth-implementation.md`
- Backend email implementation: `backend/docs/email-implementation.md`
- Frontend coding: `frontend/docs/CodingGuidelines.md`
- Frontend testing: `frontend/docs/TestingGuide.md`
- Frontend design system: `frontend/docs/design-system.md`
- Frontend UX reference: `frontend/docs/ux.md`
