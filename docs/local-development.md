# Local Development

This guide is the monorepo entrypoint for running Barback locally.

## Prerequisites

- Node.js/npm compatible with the lockfiles.
- Docker Desktop or Docker Engine.
- Playwright Chromium for frontend E2E/UI checks.
- Backend and frontend env files copied from examples.

Install Playwright Chromium after a fresh checkout or Playwright upgrade:

```bash
cd frontend
npx playwright install chromium
```

## Backend

```bash
cd backend
cp .env.example .env.dev
npm install
npm run start:dev
```

The API is served at:

```text
http://localhost:3000/api
```

`NODE_ENV` selects backend env files (`.env.dev`, `.env.prod`, `.env.test`).
The normal dev setup uses the Atlas MongoDB URI configured in `.env.dev`. The
local Docker MongoDB replica set is optional and only needed if you intentionally
point `MONGODB_URI` at it.

Useful commands:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
bash scripts/ci-local.sh
```

## Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Local Vite development expects:

```text
VITE_API_BASE_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=...
VITE_GOOGLE_CLIENT_ID=...
```

Make sure `barback.it` resolves locally:

```text
127.0.0.1 barback.it
```

The local HTTPS certificate files expected by `vite.config.ts` must exist in the
parent project directory:

```text
../barback.it.pem
../barback.it-key.pem
```

The frontend is served at:

```text
https://barback.it:5173
```

The Vite dev server proxies `/api` to the backend at `http://localhost:3000`.

Useful commands:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
npm run screenshots
bash scripts/ci-local.sh
```

## Root validation

```bash
bash scripts/ci-local.sh [backend|frontend|deploy|all]
```

See `docs/cicd.md` for the full local CI/CD and image publishing workflow.
