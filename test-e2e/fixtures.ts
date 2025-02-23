import { test as base, ElectronApplication, Page } from '@playwright/test';
import { _electron as electron } from '@playwright/test';

export const test = base.extend<{
  electronApp: ElectronApplication;
  firstWindow: Page;
}>({
  electronApp: async ({}, use) => {
    const app = await electron.launch({ args: ['.'] });
    await use(app);
    await app.close();
  },

  firstWindow: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow();
    await use(window);
  },
});

export { expect } from '@playwright/test'; 