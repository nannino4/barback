# AGENTS.md

This file provides guidance to AI coding agents (including Pi and Codex) when
working with code in this repository.

## Repository layout

This is a real git monorepo. `backend/`, `frontend/`, and `deploy/` live in
one shared repository and should be branched, committed, and reviewed together
when a change spans multiple areas. Each subdir still owns its own `docs/` and
environment files. Remote GitHub Actions workflows are intentionally not used;
keep CI/CD local via the shell scripts documented below.

- `backend/` — NestJS + MongoDB (Mongoose) API. All routes are prefixed `/api`.
- `frontend/` — React 19 + Vite + TypeScript SPA (Tailwind v4, shadcn-style UI).
- `deploy/` — Docker Compose stack for the shared `dev` EC2 host (Nginx +
  certbot TLS). See `deploy/README.md` for the TLS bootstrap and manual deploy
  flow.

Barback is an inventory-management product for cocktail bars. Product scope and
roadmap live in `backend/docs/ProductDefinition.md`.

## Commands

Run these from inside `backend/` or `frontend/` respectively.

### backend

- `npm run start:db` — optional local MongoDB + replica-set init via
  docker-compose. The normal dev setup uses Atlas via `.env.dev`, so do not run
  this unless you intentionally switch `MONGODB_URI` to the local replica set.
- `npm run start:dev` — watch-mode dev server (sets `NODE_ENV=dev`, port 3000).
- `npm run test` — Jest unit/integration suite (`--runInBand`; tests use
  `mongodb-memory-server`, no external DB needed).
- `npm run test -- src/auth/auth.service.spec.ts` — run a single test file.
  Append `-t "name"` to filter by test name.
- `npm run test:e2e` — e2e suite (`test/jest-e2e.json`).
- `npm run lint` — ESLint with `--fix`.

### frontend

- `npm run dev` — Vite dev server.
- `npm run build` — typecheck (`tsc -b`) then Vite build.
- `npm run test` — Vitest (jsdom). Single file:
  `npm run test -- src/path/file.test.ts`.
- `npm run lint` — ESLint with `--fix`.

`NODE_ENV` selects the env file (`.env.dev`, `.env.prod`, `.env.test`). Copy
`.env.example` → `.env.dev` / `.env.local` to set up. See `*/.env.example` for
required vars (JWT secrets, Stripe keys, SMTP/SES, Google OAuth, S3).

## Backend architecture

Feature modules under `src/` (`auth`, `user`, `org`, `invitation`,
`subscription`, `category`, `product`, `admin`, `storage`), each a NestJS module
with controller + service + `schemas/` + `dto/`. `common/` holds cross-cutting
infrastructure; `main.ts` + `app.module.ts` wire everything.

**Layered auth/authorization via guards** (this is the core mental model):

- `JwtAuthGuard` — validates the access token, attaches `request.user`.
- `EmailVerifiedGuard` — requires a verified email (bypass with the
  `@SkipEmailVerification()` decorator).
- `UserRolesGuard` + `@UserRoles()` — global user roles (e.g. admin).
- `OrgRolesGuard` + `@OrgRoles(...)` — org-scoped RBAC. Reads `orgId`/`id` from
  the route params, looks up the caller's `OrgRole` (`OWNER`/`MANAGER`/`STAFF`)
  in the `user-org-relation` collection, and authorizes. The
  **`UserOrgRelation` join collection is the source of truth for org membership
  and roles** — not a field on the user or org.
- `OrgSubscriptionGuard` — gates org features on an active subscription.

**Domain model**: a user activates a Stripe **subscription**; each subscription
backs one **organization** the user owns; membership/roles live in
**UserOrgRelation**; invitations bring other users into an org by email. Stripe
is integrated through `subscription/` (incl. `webhook.controller.ts`, which needs
the raw request body — `rawBody: true` is set in `main.ts`).

**Conventions**:

- Every request carries a correlation/request ID
  (`common/interceptors/correlation-id.interceptor.ts`, `correlation.service.ts`);
  include it in logs. Log at the start and end of methods using the
  `[ClassName#methodName]` context string as the second arg to the logger.
- DTOs are named `in.*.dto.ts` / `out.*.dto.ts`. Validation/transform is global
  (`ValidationPipe` with `whitelist` + `forbidNonWhitelisted` + `transform`), so
  unknown body fields are rejected.
- **Validation error messages are i18n translation keys, not English prose** —
  the frontend translates them.
- Rate limiting (`@nestjs/throttler`) is opt-in per endpoint via
  `@UseGuards(ThrottlerGuard)`, not global.

## Frontend architecture

- **Routing** (`App.tsx`): nested route-guard components compose access control —
  `ProtectedRoute` (authenticated) → `VerifiedRoute` (email verified) →
  `HasCurrentOrgRoute` (an org is selected). Route paths come from
  `constants/routes.ts` (`ROUTES.*`); don't hardcode paths.
- **Server state**: TanStack Query. Per-domain hooks in `hooks/` (`useProducts`,
  `useOrganizations`, …) wrap the typed clients in `api/`. The shared
  `api/api.ts` `ApiClient` handles timeouts, request IDs, error normalization
  (`ApiError`/`NetworkError`/`ValidationError`), and session-expiry.
  **All responses are validated with Zod schemas**; API contract types live in
  `src/types/<domain>.ts`.
- **Client state**: Zustand stores in `stores/` (`authStore`,
  `organizationStore`, `themeStore`, `languageStore`). JWTs live in
  `localStorage` via `AuthTokenManager` (`lib/auth-tokens.ts`).
- **i18n is mandatory** — no hardcoded user-facing strings. Use the `useI18n`
  hook and update both English and Italian locale files together.
- **Toasts**: import `notify` from `lib/notify.ts`, never `react-hot-toast`
  directly. Prefer declarative error rendering over toast for form/validation
  errors.

## Code style

Enforced by ESLint — read the full guidelines before non-trivial changes.

- **Allman brace style** (braces on their own line); single-line blocks allowed.
- Indentation: **backend 4 spaces, frontend 2 spaces**. No tabs. Trailing commas
  on multiline. ~80-col target.
- `strict: true` everywhere; avoid `any`. `const` by default. Boolean names use
  `is`/`has`/`should`.
- **DTO fields use optional `?`, never `| null`** (backend
  `CodingGuidelines.md`).
- Frontend imports use the `@/` alias for internal modules.
- Styling: theme via OKLCH **CSS variables** (`bg-background`,
  `text-foreground`, …) — **never use `dark:` variants** for themed colors.
  Prefer the layout components (`Stack`, `Grid`, `PageContainer`, `Section`)
  over ad-hoc spacing divs, and reuse existing `components/ui` before writing new
  markup.

Full details: `backend/docs/CodingGuidelines.md`,
`backend/docs/TestingGuidelines.md`, `frontend/docs/CodingGuidelines.md`,
`frontend/docs/TestingGuide.md`, `frontend/docs/TechStackGuide.md`,
`frontend/docs/design-system.md`.

## Testing philosophy

When a test fails, **fix the implementation, not the test** (unless the test
encodes wrong behavior). Tests assert on real outcomes: query the DB to verify
writes rather than asserting on internal calls; mock only external services
(Stripe, email, S3). Backend service tests are `*.service.spec.ts`;
controller/integration tests are `*.controller.spec.ts` / `test/*.e2e-spec.ts`.

## Git workflow

Trunk-ish flow for the monorepo: `main` (production) ← `develop`
(integration → `dev` env) ← `feature/<name>` / `hotfix/<name>`. This is
currently a solo project, so remote CI/PR requirements are intentionally not
enforced.

CI/CD is **local-only**. Run `bash scripts/ci-local.sh` in `backend/` or
`frontend/` for validation, or use the root convenience wrapper
`bash scripts/ci-local.sh [backend|frontend|deploy|all]`. Run
`bash scripts/publish-image.sh dev` from `backend/` or `frontend/` to publish
Docker Hub images from the local development/agent machine. Docker images are
built with plain `docker build`, not Docker Buildx. Deploys to EC2 are
**manual** (`deploy/deploy-dev.sh` or `deploy/scripts/deploy-dev-remote.sh`). See
`backend/docs/CICD.md` and `frontend/docs/CICD.md`.
