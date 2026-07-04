# Barback

Barback is a mobile-first inventory management platform for cocktail bars. It helps bar owners, managers, and staff keep stock counts accurate, manage venue teams, and prepare for subscription-backed operations without relying on spreadsheets.

> Status: MVP in active development. The current staging environment is used for product validation and demo workflows.

## What it does

- **Authentication and account management**
  - Email/password and Google sign-in
  - Email verification and password reset
  - User profile, avatar upload, language, and timezone preferences
- **Venue / organization management**
  - Multi-organization membership
  - Owner, manager, and staff roles
  - Invitations, member management, and role-gated settings
- **Inventory operations**
  - Product and category CRUD
  - Current stock levels
  - Manual stock adjustments with audit logs
  - Product detail and stock history views
- **Billing foundation**
  - Stripe-backed subscriptions
  - 90-day frictionless trial flow
  - Per-venue subscription payment method assignment
  - Personal saved payment method management
- **Internationalized UI**
  - English and Italian translations
  - Locale-aware date formatting and timezone support

## Tech stack

### Backend

- NestJS + TypeScript
- MongoDB / Mongoose
- JWT authentication and guard-based authorization
- Stripe subscriptions and webhooks
- S3-compatible image storage integration
- Jest with MongoDB memory server for local tests

### Frontend

- React 19 + Vite + TypeScript
- TanStack Query for server state
- Zustand for client state
- Zod for runtime API contract validation
- Tailwind CSS with CSS-variable theming
- Radix/shadcn-style UI components
- i18next English/Italian localization
- Vitest and Playwright

### Deployment

- Dockerized backend and frontend
- Docker Compose stack on a shared EC2 staging host
- Nginx reverse proxy and TLS termination
- Docker Hub image publishing from local CI/CD scripts
- Terraform references for supporting AWS resources under `deploy/terraform/`

## Repository layout

```text
backend/   NestJS API. All routes are prefixed with /api.
frontend/  React/Vite SPA.
deploy/    Docker Compose deployment, Nginx, Terraform, and ops docs.
scripts/   Root-level local validation helpers.
.pi/       Agent workflow skills and project-specific automation guidance.
```

## Branch and deployment model

This repository intentionally uses local CI/CD rather than remote GitHub Actions.

- `develop` — active integration branch.
- `staging` — branch intended to represent what is deployed to the shared staging/demo environment.
- Production branching is not finalized yet.

Deployment flow for staging:

1. Merge or fast-forward `staging` to the validated commit.
2. Run local CI.
3. Publish backend and frontend Docker images.
4. Deploy the selected image tags from `deploy/`.

## Getting started locally

### Prerequisites

- Node.js matching the project lockfiles
- npm
- Docker Desktop or Docker Engine
- MongoDB, or the Docker Compose/dev environment described in the backend docs
- Playwright Chromium for frontend E2E checks

Install Playwright browser dependencies after a fresh checkout or Playwright upgrade:

```bash
cd frontend
npx playwright install chromium
```

### Backend

```bash
cd backend
cp .env.example .env.dev
npm install
npm run start:dev
```

Useful backend commands:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
bash scripts/ci-local.sh
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Useful frontend commands:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
npm run screenshots
bash scripts/ci-local.sh
```

## Local CI/CD

Run both backend and frontend validation from the repository root:

```bash
bash scripts/ci-local.sh all
```

Publish staging images locally after validation:

```bash
cd backend
DOCKER_DEFAULT_PLATFORM=linux/amd64 \
DOCKER_HUB_USERNAME=<dockerhub-user> \
DOCKER_HUB_TOKEN=<token> \
bash scripts/publish-image.sh dev

cd ../frontend
DOCKER_DEFAULT_PLATFORM=linux/amd64 \
DOCKER_HUB_USERNAME=<dockerhub-user> \
DOCKER_HUB_TOKEN=<token> \
bash scripts/publish-image.sh dev
```

See `docs/cicd.md` and `docs/operations/deploy-dev.md` for the full deployment procedure.

## Quality standards

- Backend DTOs use optional fields rather than nullable API fields.
- Backend validation messages are translation keys.
- Frontend user-facing strings are localized in English and Italian.
- Frontend API responses are validated with Zod schemas.
- UI changes require browser/Playwright visual validation before completion.
- Secrets, env files, SSH keys, Terraform state, and deploy runtime secret files are gitignored and must not be committed.

## Documentation

- Documentation index: `docs/README.md`
- Product and roadmap: `docs/product.md`, `docs/roadmap.md`
- Architecture and local setup: `docs/architecture.md`, `docs/local-development.md`
- Testing and CI/CD: `docs/testing.md`, `docs/cicd.md`
- Feature references: `docs/features/`
- Operations: `docs/operations/`
- Backend implementation references: `backend/docs/`
- Frontend implementation/UI references: `frontend/docs/`

## License

No open-source license has been selected yet. All rights reserved unless a license is added.
