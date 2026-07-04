# Frontend Coding Reference

This document is a durable reference for frontend code conventions. Agent
workflows and checklists live in `.pi/skills/barback-frontend-development` and
`.pi/skills/barback-ui-ux`.

## Formatting

- Allman brace style; single-line blocks are allowed.
- 2-space indentation, no tabs.
- Trailing commas on multiline structures.
- Keep lines near 80 columns when practical.

## TypeScript

- `strict: true` is expected.
- Avoid `any`; prefer precise types or `unknown` with narrowing.
- Add explicit types when inference is not clear.
- Handle `null` and `undefined` explicitly.
- Use `const` by default.
- Use `void` when intentionally ignoring a safe promise result, such as
  navigation or a form handler whose errors are handled elsewhere.

## Imports

- Use the `@/` alias for internal imports.
- Import order:
  1. external libraries;
  2. internal modules;
  3. type imports with `type`.

## API and type names

- API request/body types: `*Request`.
- API response types: `*Response`.
- Zod API schemas follow the same names plus `Schema`.
- Shared enums use neutral names, e.g. `OrgRole`, `SubscriptionStatus`.
- Client-only forms use `*FormSchema` and `*FormData`.
- API contracts live in `src/types/<domain>.ts`.
- Form schemas live in `src/types/<domain>-forms.ts`.
- UI-only types must not use `Request` or `Response` suffixes.

## Files and names

- Components: PascalCase, e.g. `ProductForm.tsx`.
- Hooks: camelCase starting with `use`, e.g. `useProducts.ts`.
- Utilities: camelCase, e.g. `formatCurrency.ts`.
- Constants: camelCase file names, SCREAMING_SNAKE_CASE values where appropriate.
- Component prop interfaces: `ComponentNameProps`.

## Routing and navigation

- Route paths come from `src/constants/routes.ts`; do not hardcode internal
  routes.
- Use React Router navigation for internal routes.
- Use `window.location.href` for external redirects and OAuth providers.
- Use `{ replace: true }` when back navigation should skip the intermediate page.

## i18n

All user-facing text must use the localization system.

- Use `useI18n` in components with text.
- Organize keys by feature, e.g. `auth.login.emailPlaceholder`.
- Update English and Italian locale files together.
- Backend validation errors are translation keys; render localized messages on
  the frontend.

## Feedback and errors

- Import `notify` from `src/lib/notify.ts`; never import `react-hot-toast`
  directly.
- Prefer declarative form/page error blocks from query/mutation error state.
- Use toasts for transient success/background feedback, not form validation.
- Use `getLocalizedErrorMessage` and known-error type guards for API errors.
- Keep form data available so the user can correct and retry.

## Component and UI reuse

- Check existing `src/components`, `src/components/ui`, and feature components
  before creating new markup.
- Extend a close existing component instead of duplicating it.
- Use layout components (`Stack`, `Grid`, `PageContainer`, `Section`) when they
  fit.

For visual design, loading states, focus states, theme colors, touch targets, and
UI experimentation, see:

- `frontend/docs/design-system.md`
- `frontend/docs/ux.md`
- `frontend/docs/UIExperimentationGuide.md`

## Local validation

Remote GitHub Actions CI is intentionally not used. Validate frontend changes
locally:

```bash
cd frontend
npm run lint
npm run test
npm run test:e2e
npm run build
bash scripts/ci-local.sh
```

For Playwright browser setup after a fresh checkout:

```bash
cd frontend
npx playwright install chromium
```

See `frontend/docs/TestingGuide.md`, `docs/testing.md`, and `docs/cicd.md` for details.
