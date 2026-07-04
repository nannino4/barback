# AGENTS.md

This file is the always-loaded orientation for coding agents. Keep it concise.
Detailed, task-specific workflows live in Pi skills under `.pi/skills/`; durable
reference docs live under `backend/docs/`, `frontend/docs/`, and `deploy/`.

## Repository layout

Barback is an inventory-management product for cocktail bars.

- `backend/` — NestJS + MongoDB API. All routes are prefixed `/api`.
- `frontend/` — React 19 + Vite + TypeScript SPA.
- `deploy/` — Docker Compose stack for the shared `dev` EC2 host.
- `docs/` — monorepo-level product, feature, CI/CD, architecture, and operations docs.

This is one real git monorepo. Changes spanning backend, frontend, and deploy
should be considered together.

## Use the right skill

When available, load the relevant project skill before non-trivial work:

- `barback-backend-development` — backend NestJS/API work.
- `barback-frontend-development` — frontend React/API/store/form work.
- `barback-ui-ux` — UI, styling, responsive, copy, visual feedback.
- `barback-testing` — adding/fixing/running tests.
- `barback-local-cicd` — validation, Docker image publishing, deploy flow.

## Core commands

Run from `backend/`:

```bash
npm run start:dev
npm run test
npm run test -- src/path/file.spec.ts
npm run test:e2e
npm run lint
bash scripts/ci-local.sh
```

Run from `frontend/`:

```bash
npm run dev
npm run test
npm run test -- src/path/file.test.ts
npm run test:e2e
npm run screenshots
npm run build
npm run lint
bash scripts/ci-local.sh
```

After a fresh frontend checkout or Playwright update, run:

```bash
cd frontend
npx playwright install chromium
```

`NODE_ENV` selects backend env files (`.env.dev`, `.env.prod`, `.env.test`).
Frontend local development uses `.env.local`. Copy from `*.env.example` when
setting up.

## Non-negotiables

- CI/CD is local-only. Remote GitHub Actions are intentionally not used.
- Fix implementation before changing tests unless the test encodes wrong
  behavior.
- Do not commit secrets, env files, deploy secret files, Terraform state, or SSH
  keys.
- Backend DTO fields use optional `?`, never `| null`.
- Backend validation messages are i18n translation keys.
- Frontend user-facing strings must use i18n and update English + Italian.
- Frontend internal imports use the `@/` alias.
- Frontend UI uses CSS-variable theme colors; do not use `dark:` color variants.
- Use `notify` from `src/lib/notify.ts`, never `react-hot-toast` directly.
- For any UI change, always perform visual validation with Playwright/browser
  tooling before final response. Report what was inspected (route/viewport/theme)
  or explicitly state if tooling blocked validation and why.

## Reference docs

- Product/domain: `docs/product.md`, `docs/features/`
- Roadmap/architecture/setup: `docs/roadmap.md`, `docs/architecture.md`,
  `docs/local-development.md`
- Testing/CI/CD: `docs/testing.md`, `docs/cicd.md`
- Backend code/testing: `backend/docs/CodingGuidelines.md`,
  `backend/docs/TestingGuidelines.md`
- Frontend code/testing/UI: `frontend/docs/CodingGuidelines.md`,
  `frontend/docs/TestingGuide.md`, `frontend/docs/design-system.md`,
  `frontend/docs/UIExperimentationGuide.md`, `frontend/docs/ux.md`
- Operations/deploy: `docs/operations/`, `deploy/README.md`
