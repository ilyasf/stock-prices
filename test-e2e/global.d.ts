import { ElectronApplication, Page } from '@playwright/test';

declare global {
  namespace PlaywrightTest {
    interface Fixtures {
      electronApp: ElectronApplication;
      firstWindow: Page;
    }
  }
}

export {}; 