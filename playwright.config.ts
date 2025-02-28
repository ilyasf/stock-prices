import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test-e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  testMatch: '*.spec.ts',
  timeout: 30000
}); 