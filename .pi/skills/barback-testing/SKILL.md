---
name: barback-testing
description: Testing strategy for Barback. Use when adding, fixing, reviewing, or running backend Jest tests, frontend Vitest tests, Playwright E2E tests, test utilities, or local CI validation.
---

# Barback Testing

## Core principle

Tests should verify user/business outcomes, not implementation details. If a test
fails, fix the implementation unless the test encodes the wrong behavior.

## Backend

```bash
cd backend
npm run test
npm run test -- src/path/file.spec.ts
npm run test -- src/path/file.spec.ts -t "test name"
```

- Jest runs in-band.
- Use `mongodb-memory-server` for realistic database behavior.
- Query the database to verify writes.
- Mock third-party network services in the default suite: Stripe, email, S3,
  OAuth, external APIs.
- Keep real third-party checks explicit and opt-in using sandbox/simulator
  credentials.

Recommended external-service stance:

- Default local CI: deterministic tests with mocked third-party network calls.
- Separate contract checks: Stripe test mode, SES simulator/SMTP inbox, S3 dev
  bucket, Google OAuth test credentials.
- Manual pre-deploy: deployed webhook/DNS/runtime-secret checks.

This balances realism with reliability: database behavior stays real in the
normal suite, while third-party reality checks are available without making every
local test run flaky, slow, or dependent on credentials.

## Frontend

```bash
cd frontend
npm run test
npm run test -- src/path/file.test.ts
npm run test:e2e
```

- Vitest/jsdom for components, hooks, utilities, and form behavior.
- Playwright is mandatory for browser smoke tests, responsive checks, and UI
  feedback.
- After a fresh checkout or Playwright version update, run
  `npx playwright install chromium` once.
- Use Playwright screenshots for visual review:

```bash
cd frontend
npm run screenshots
```

## What to test

- User interactions and visible outcomes.
- HTTP contracts, status codes, validation behavior, persisted state.
- Loading, empty, error, and success states.
- Role-based access and authorization behavior.
- Responsive UI when layout changes.

## What not to test

- Internal component state.
- Internal function calls when a real outcome can be observed.
- Third-party library internals.
- Styling that does not affect behavior, except via visual/Playwright review.

Reference docs:

- `docs/testing.md`
- `backend/docs/TestingGuidelines.md`
- `frontend/docs/TestingGuide.md`
- `frontend/docs/UIExperimentationGuide.md`
