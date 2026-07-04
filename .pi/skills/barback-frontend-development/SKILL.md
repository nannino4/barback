---
name: barback-frontend-development
description: Frontend development workflow for Barback. Use when modifying React/Vite/TypeScript SPA code, API clients, hooks, stores, routes, forms, i18n, Zod contracts, or frontend tests.
---

# Barback Frontend Development

Use this skill for changes under `frontend/`.

## Architecture rules

- Routes come from `src/constants/routes.ts`; do not hardcode internal paths.
- Access control composes route guards: authenticated → email verified → current
  organization selected.
- Server state uses TanStack Query hooks in `src/hooks/` wrapping typed clients in
  `src/api/`.
- API responses are validated with Zod schemas in `src/types/<domain>.ts`.
- Client state uses Zustand stores in `src/stores/`.
- JWTs live in localStorage via `AuthTokenManager`.

## Code conventions

- Use Allman braces and 2-space indentation.
- Use `@/` alias for internal imports.
- Use `const` by default; avoid `any`.
- API types are `*Request` / `*Response`; form schemas are `*FormSchema` /
  `*FormData`.
- Prefer existing components before creating new UI.

## i18n and feedback

- No hardcoded user-facing strings.
- Use `useI18n` and update English and Italian locale files together.
- Import `notify` from `src/lib/notify.ts`; never import `react-hot-toast`
  directly.
- Form/API errors should render declaratively from mutation/query error state.
- Use localized error helpers and keep form data available for retry.

## UI checks

For any UI change, load `barback-ui-ux` too. Playwright/browser inspection is
required before the final response, not just before claiming validation. The
final response must say what was inspected (route/viewport/theme) or explicitly
state that tooling blocked validation and why.

## Validation commands

```bash
cd frontend
npm run lint
npm run test
npm run test:e2e
npm run build
```

After a fresh checkout or Playwright version update, run
`npx playwright install chromium` once.

For screenshots during UI review:

```bash
cd frontend
npm run screenshots
```

Before publishing or merging frontend changes, run:

```bash
cd frontend
bash scripts/ci-local.sh
```

Reference docs:

- `docs/product.md`
- `docs/features/`
- `frontend/docs/CodingGuidelines.md`
- `frontend/docs/TechStackGuide.md`
- `frontend/docs/TestingGuide.md`
- `frontend/docs/UIExperimentationGuide.md`
