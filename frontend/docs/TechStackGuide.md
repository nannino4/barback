# Barback Frontend - Technology Stack Notes

This document is the frontend-specific technology reference. Product, deployment,
and monorepo architecture docs live under root-level `docs/`.

## Core stack

- **Vite** for development and production builds.
- **React 19** with functional components and hooks.
- **TypeScript** with strict typing.
- **React Router** for client-side routing.
- **TanStack Query** for server state.
- **Zustand** for client/app state.
- **React Hook Form** for forms.
- **Zod** for runtime API contract and form validation.
- **Tailwind CSS v4** with CSS-variable theme tokens.
- **Radix/shadcn-style components** copied into the codebase.
- **Lucide React** for icons.
- **i18next/react-i18next** for English and Italian localization.
- **Vitest + React Testing Library** for unit/component tests.
- **Playwright** for browser smoke tests, responsive checks, screenshots, and UI
  validation.

## Architecture patterns

- Routes come from `src/constants/routes.ts`.
- Access control composes route guards: authenticated → email verified → current
  organization selected.
- Server data flows through hooks in `src/hooks/` that wrap typed clients in
  `src/api/`.
- API response schemas live in `src/types/<domain>.ts` and are validated with
  Zod.
- Form schemas live in `src/types/<domain>-forms.ts`.
- Client state lives in `src/stores/`.
- JWTs are managed through `AuthTokenManager`.

## Project structure

```text
src/
├── api/                 # Typed API clients
├── components/
│   ├── ui/              # Shared UI primitives/components
│   ├── features/        # Feature-specific components
│   └── layout/          # App shell/navigation/layout
├── constants/           # Routes and shared constants
├── hooks/               # TanStack Query hooks and custom hooks
├── lib/                 # Utilities, auth/token helpers, notify, formatting
├── pages/               # Route components
├── stores/              # Zustand stores
└── types/               # API schemas/types and form schemas
```

## UI and styling

- Use existing UI/layout components before creating custom markup.
- Use semantic CSS-variable color classes (`bg-background`, `text-foreground`,
  `border-border`, etc.).
- Do not use `dark:` variants for theme colors.
- Keep mobile-first responsive behavior.
- See `design-system.md` and `ux.md` for detailed UI rules.

## Validation

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
npm run screenshots
```

## Related docs

- Monorepo architecture: `../../docs/architecture.md`
- Local development: `../../docs/local-development.md`
- Testing strategy: `../../docs/testing.md`
- CI/CD: `../../docs/cicd.md`
- Frontend coding guidelines: `CodingGuidelines.md`
- Frontend testing guide: `TestingGuide.md`
- UI experimentation: `UIExperimentationGuide.md`
