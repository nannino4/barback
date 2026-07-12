# Barback Frontend - UI Experimentation Guide

UI changes should be judged in the browser, not only in prose or code review.
When a design choice is subjective, build visible alternatives and compare them
with Playwright/browser feedback before porting the winner into production code.

## Scientist lens

- Define the single variable under test: spacing, hierarchy, card treatment,
  action placement, color treatment, etc.
- Build 2-4 comparable variants when the direction is genuinely open.
- Change one variable at a time so the comparison is clean.
- Prefer real app components, real Tailwind tokens, real i18n, and realistic data.
- Give the user a short, opinionated read of each variant instead of only saying
  "I made options".

## Default workflow

1. State the UI question and the variable being tested.
2. Create temporary variants in the project tree, preferably near the affected
   component or under a clearly named temporary/lab folder.
3. Keep shared setup/data in one partial/helper so variants differ only where
   intended.
4. Connect Playwright/browser tooling to the user's already-running dev server.
   Use `PLAYWRIGHT_BASE_URL` when set; otherwise try `http://localhost:5173` or
   the HTTPS local app URL `https://barback.it:5173`.
5. For protected surfaces, authenticate through `/auth/login` with local-only
   credentials from `BARBACK_DEV_EMAIL` and `BARBACK_DEV_PASSWORD`, then verify
   access to `/inventory`. Never commit or print credentials.
6. Inspect variants with Playwright/browser tooling at minimum mobile and desktop
   widths; include tablet when layout columns are involved. If role-specific UI
   matters, use the organization switcher with the same account to inspect the
   relevant owner/manager/staff organization context.
7. Check loading, empty, error, success, responsive, light theme, dark theme, and
   localization states when relevant.
8. Present screenshots or live routes plus your recommendation.
9. After a decision, port only the winning direction into real production
   components and remove temporary experiment code.
10. Validate with:

   ```bash
   npm run lint
   npm run test
   npm run test:e2e
   npm run build
   ```

## Playwright screenshots

Generated screenshots are working artifacts for the agent, not deliverables.
They are gitignored under `frontend/docs/screenshots/`.

Run the canonical screenshot set from `frontend/` while the user's dev server is
running. Agents should connect to that server by setting `PLAYWRIGHT_BASE_URL`
when it is not the default `http://localhost:5173`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run screenshots
```

The script writes mobile, tablet, and desktop screenshots for the public app
surfaces to `docs/screenshots/`.

## Viewport convention

| Label | Width | Use |
|---|---:|---|
| mobile | 375 px | primary mobile check |
| tablet | 768 px | column collapse / two-column sanity |
| desktop | 1280 px | primary desktop check |

## Fast overflow audit

Use this pattern in Playwright when a screenshot is not needed:

```ts
const overflow = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  viewportWidth: window.innerWidth,
}));
```

Horizontal overflow greater than 1px on mobile/tablet should be treated as a bug
unless explicitly justified.

## Production rule

Temporary experiment routes, mockups, and screenshots must not ship in production
builds. Remove experiment-only code after the selected variant is implemented.
