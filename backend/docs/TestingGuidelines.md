## Testing Guidelines

**Core Testing Principle**:
- **Tests Must Reflect Reality**: Tests should represent real-world scenarios and validate actual expected behavior. If a test fails, examine whether the underlying code or architecture needs fixing rather than modifying the test to pass artificially.
- **Fix Code, Not Tests**: When tests fail, prioritize fixing the underlying implementation, validation, error handling, or architecture rather than adjusting test expectations to match flawed behavior.
- **Meaningful Assertions**: Test scenarios that users will actually encounter and that matter for the application's correct functioning.

## Test Layers

### Default automated suite

The default `npm run test` suite should be deterministic, local, and safe to run
frequently. It is the suite run by local CI.

- Use `mongodb-memory-server` for database behavior instead of mocking Mongoose.
- Run Jest in-band (`--runInBand`) to reduce MongoDB memory-server flakiness.
- Mock external network services by default: Stripe, email providers, S3, OAuth,
  and other third-party APIs.
- Assert on real outcomes: HTTP contracts, returned DTOs, and persisted database
  state.
- Do not assert on internal method calls unless there is no meaningful external
  outcome to observe.

### External-service contract checks

Real external services are valuable because they catch integration drift that
mocks cannot see. They should be explicit, opt-in checks rather than the default
fast suite.

Use sandbox/simulator services where available:

- Stripe test mode for payment and webhook contract checks.
- SES simulator or SMTP test inboxes for email delivery checks.
- Dedicated S3/dev buckets for storage checks.
- Google OAuth test credentials for OAuth smoke checks.

These tests should:

- require explicit environment variables;
- never run accidentally without credentials;
- avoid mutating production data;
- clean up any remote resources they create;
- be documented as pre-deploy or integration-contract checks.

### Manual pre-deploy smoke checks

Some reality checks are best kept manual until the product needs heavier
operational automation: Stripe Dashboard webhook configuration, SES DNS/identity
state, EC2 runtime secrets, and deployed end-to-end flows.

## Service Tests (Unit-style)

- Test individual service methods in isolation.
- Mock external services (Stripe, email providers, external APIs).
- Use in-memory MongoDB instance (`mongodb-memory-server`).
- **Focus on output validation**: Test the final state/result rather than implementation details.
- **Database-driven assertions**: When a function writes to the database, verify the result by querying the database.
- **Avoid implementation coupling**: Don't test internal function calls or implementation details.
- File pattern: `*.service.spec.ts`.

## Controller Tests (Integration/E2E)

- Test HTTP routes end-to-end through NestJS with real validation, guards, DTO
  transformation, and database writes.
- Use in-memory MongoDB for fast, isolated persistence.
- Mock third-party network calls in the default suite; move real third-party
  calls to explicit external-service contract checks.
- Test authentication, authorization, validation, and complete request flows.
- **Focus on HTTP contracts**: Test request/response formats, status codes, and data persistence.
- File patterns: `*.controller.spec.ts` or `test/*.e2e-spec.ts`.

## Database Setup

- Use `mongodb-memory-server` for default automated tests.
- Prefer fresh state per test file or test case through shared setup utilities.
- Manage connection lifecycle carefully and close connections in teardown.
- Keep tests in-band by default to reduce fleeting memory-server timeouts.
- If memory-server instability persists, improve setup/teardown and test
  isolation before weakening assertions.

## Output-Focused Testing Principles

- **Test the "what", not the "how"**: Verify what the function achieves, not how it does it.
- **Verify persistent state**: For functions that modify data, check the final state in the database.
- **Test business outcomes**: Focus on the business logic and data transformations.
- **Minimize mocking**: Mock only external dependencies in the default suite, not internal logic.
- **Database assertions**: Use direct database queries to verify data changes rather than relying only on service method return values.
