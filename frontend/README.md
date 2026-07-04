# Barback Frontend

React 19 + Vite + TypeScript SPA for Barback.

## Documentation

Monorepo-level docs:

- Product definition: `../docs/product.md`
- Roadmap: `../docs/roadmap.md`
- Architecture: `../docs/architecture.md`
- Local development: `../docs/local-development.md`
- Testing strategy: `../docs/testing.md`
- CI/CD: `../docs/cicd.md`
- Feature references: `../docs/features/`

Frontend-specific docs:

- Coding guidelines: `docs/CodingGuidelines.md`
- Testing guide: `docs/TestingGuide.md`
- Design system: `docs/design-system.md`
- UX reference: `docs/ux.md`
- UI experimentation: `docs/UIExperimentationGuide.md`
- Frontend technology notes: `docs/TechStackGuide.md`

## Installation

```bash
npm install
```

## Running the dev server

```bash
cp .env.example .env.local
npm run dev
```

Ensure `.env.local` contains required dev values, especially:

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
Start the backend separately from `backend/`.

## Commands

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
npm run screenshots
bash scripts/ci-local.sh
```

Install Playwright Chromium after a fresh checkout or Playwright update:

```bash
npx playwright install chromium
```
