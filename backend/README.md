# Barback Backend

NestJS + MongoDB API for Barback. All routes are prefixed with `/api`.

## Documentation

Monorepo-level docs:

- Product definition: `../docs/product.md`
- Roadmap: `../docs/roadmap.md`
- Architecture: `../docs/architecture.md`
- Local development: `../docs/local-development.md`
- Testing strategy: `../docs/testing.md`
- CI/CD: `../docs/cicd.md`

Backend-specific docs:

- Coding guidelines: `docs/CodingGuidelines.md`
- Testing guidelines: `docs/TestingGuidelines.md`
- Auth implementation: `docs/auth-implementation.md`
- Email implementation: `docs/email-implementation.md`

## Installation

```bash
npm install
```

## Running the dev server

The normal development setup uses the shared Atlas MongoDB database configured in
`.env.dev`, so you do not need to start the local Docker MongoDB replica set for
day-to-day development.

```bash
cp .env.example .env.dev
npm run start:dev
```

The API is served at:

```text
http://localhost:3000/api
```

### Optional local MongoDB

Only run this if you intentionally want to use the local Docker MongoDB replica
set instead of Atlas. Update `.env.dev` so `MONGODB_URI` points at the local
replica set, then run:

```bash
npm run start:db
npm run start:dev
```

## Commands

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
bash scripts/ci-local.sh
```
