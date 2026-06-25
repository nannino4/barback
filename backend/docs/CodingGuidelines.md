# Backend Coding Reference

This document is a durable reference for backend code conventions. Agent
workflows and checklists live in `.pi/skills/barback-backend-development`.

## Formatting

- Allman brace style; single-line blocks are allowed.
- 4-space indentation, no tabs.
- Trailing commas on multiline structures.
- Keep lines near 80 columns when practical.

## TypeScript

- `strict: true` is expected.
- Use `const` by default; use `let` only when needed; never use `var`.
- Avoid `any`; prefer precise types or `unknown` with narrowing.
- Name booleans with `is`, `has`, `should`, etc.
- Prefer early returns over deep nesting.

## NestJS structure

- Keep controllers thin.
- Put business logic in services.
- Use guards for auth/authorization.
- Use pipes/decorators for validation and transformation.
- Keep feature code grouped by module under `src/<feature>/`.

## DTO conventions

DTO files must indicate direction:

- Input DTOs: `in.*.dto.ts`
- Output DTOs: `out.*.dto.ts`

DTO fields represent API contracts where fields are present or absent. Use
optional fields, not nullable fields:

```ts
export class OutUserPublicDto
{
    @Expose()
    id!: string;

    @Expose()
    profilePictureUrl?: string;
}
```

Do not use these forms in DTOs:

```ts
profilePictureUrl: string | null;
profilePictureUrl?: string | null;
```

Database schemas may contain `null`; DTOs should not expose that implementation
detail unless the public API intentionally needs a nullable value.

## Validation and errors

- Unknown body fields are rejected by the global validation pipe.
- Validation messages should be i18n translation keys, not English prose.
- Use appropriate HTTP exceptions and project-specific domain exceptions where
  they exist.
- Handle promise rejections and exceptions deliberately.

## Logging

- Include request/correlation context in request-scoped logs.
- Log start and end of important service methods.
- Pass method context as the second logger argument:

```ts
this.logger.debug('User created successfully', 'UserService#createUser');
```

## Documentation comments

- Add JSDoc for public APIs when it helps consumers.
- Prefer comments for non-obvious decisions, not for restating code.

## Local validation

Remote GitHub Actions CI is intentionally not used. Validate backend changes
locally:

```bash
cd backend
npm run lint
npm run test
npm run build
bash scripts/ci-local.sh
```

See `backend/docs/TestingGuidelines.md` and `backend/docs/CICD.md` for details.
