import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const outputDir = path.resolve('docs/screenshots');

const pages = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/auth/login' },
  { name: 'register', path: '/auth/register' },
  { name: 'forgot-password', path: '/auth/forgot-password' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
  deviceScaleFactor: 2,
});
const page = await context.newPage();

for (const viewport of viewports)
{
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });

  for (const target of pages)
  {
    const url = new URL(target.path, baseURL).toString();
    await page.goto(url, { waitUntil: 'networkidle' });

    await page.screenshot({
      path: path.join(outputDir, `${target.name}-${viewport.name}.png`),
      fullPage: true,
    });
  }
}

await browser.close();
console.log(`Screenshots written to ${outputDir}`);
