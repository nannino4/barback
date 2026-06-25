import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const shouldStartWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== 'true';
const webServerCommand = [
  'VITE_DEV_SERVER_HOST=localhost',
  'VITE_DEV_SERVER_HTTPS=false',
  'VITE_DEV_SERVER_STRICT_PORT=true',
  'npm run dev',
].join(' ');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: shouldStartWebServer
    ? {
      command: webServerCommand,
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120_000,
    }
    : undefined,
});
