import { expect, test } from '@playwright/test';

const publicRoutes = [
  { path: '/', expectedText: /barback/i },
  { path: '/auth/login', expectedText: /login|accesso/i },
  { path: '/auth/register', expectedText: /create your account|crea/i },
  { path: '/auth/forgot-password', expectedText: /forgot your password|password/i },
];

test.describe('public routes', () =>
{
  for (const route of publicRoutes)
  {
    test(`renders ${route.path}`, async ({ page }) =>
    {
      await page.goto(route.path);

      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('main')).toContainText(route.expectedText);
    });
  }

  test('login form exposes email and password fields', async ({ page }) =>
  {
    await page.goto('/auth/login');

    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /sign in|accedi/i }),
    ).toBeVisible();
  });
});

test.describe('responsive smoke checks', () =>
{
  for (const width of [375, 768, 1280])
  {
    test(`landing page has no horizontal overflow at ${width}px`, async ({ page }) =>
    {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const overflow = await page.evaluate(() =>
      {
        const scrollWidth = document.documentElement.scrollWidth;
        const viewportWidth = window.innerWidth;

        return Math.max(0, scrollWidth - viewportWidth);
      });

      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
