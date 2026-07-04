# Testing Strategy

Tests should verify user and business outcomes, not implementation details. If a
test fails, fix the implementation unless the test encodes the wrong behavior.

## Backend

Run from `backend/`:

```bash
npm run test
npm run test -- src/path/file.spec.ts
npm run test -- src/path/file.spec.ts -t "test name"
npm run test:e2e
```

Guidelines:

- Jest runs in-band to reduce MongoDB memory-server flakiness.
- Use `mongodb-memory-server` for realistic database behavior.
- Assert on HTTP contracts, DTOs, and persisted state.
- Query the database to verify writes.
- Mock third-party network services in the default suite: Stripe, email, S3,
  OAuth, and other external APIs.
- Keep real third-party checks explicit and opt-in using sandbox/simulator
  credentials.

Backend implementation details live in `backend/docs/TestingGuidelines.md`.

## Frontend

Run from `frontend/`:

```bash
npm run test
npm run test -- src/path/file.test.ts
npm run test:e2e
npm run screenshots
```

Guidelines:

- Vitest/jsdom for components, hooks, utilities, and form behavior.
- React Testing Library tests user-visible behavior.
- Playwright is required for E2E smoke tests, responsive checks, and UI visual
  validation.
- Use Playwright screenshots as working artifacts for UI review.

Frontend implementation details live in `frontend/docs/TestingGuide.md`.

## What to test

- User interactions and visible outcomes.
- HTTP contracts, status codes, validation behavior, and persisted state.
- Loading, empty, error, and success states.
- Role-based access and authorization behavior.
- Responsive behavior when layout changes.

## What not to test

- Internal component state.
- Internal function calls when a real outcome can be observed.
- Third-party library internals.
- Styling that does not affect behavior, except through visual/browser review.

## External-service checks

Default local CI should remain deterministic. Real external checks are useful but
should be separate and explicit:

- Stripe test mode for payment/webhook contract checks.
- SES simulator or SMTP test inboxes for email delivery checks.
- Dedicated S3/dev buckets for storage checks.
- Google OAuth test credentials for OAuth smoke checks.

These checks must require explicit env vars, avoid production data, clean up any
remote resources, and never run accidentally in the default suite.
