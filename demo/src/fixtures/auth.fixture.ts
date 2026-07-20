import { test as base, expect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { EnvConfig } from '@/utils/env.config';

type AuthFixtures = {
  authenticatedPage: void;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    // Navigate to app
    await loginPage.goto();

    // Login with default credentials
    await loginPage.login(
      EnvConfig.CREDENTIALS.USERNAME,
      EnvConfig.CREDENTIALS.PASSWORD
    );

    // Wait for dashboard/home page after login (flexible - may not always navigate)
    await Promise.race([
      page.waitForNavigation({ timeout: 15000 }).catch(() => null),
      page.waitForTimeout(3000)
    ]);

    // Wait for dashboard to fully load
    await page.waitForTimeout(2000);

    // Verify we're logged in by checking if Recruitment menu is visible
    const recruitmentMenu = page.locator('span, a', { hasText: /^Recruitment$/ }).first();
    await recruitmentMenu.waitFor({ timeout: 10000, state: 'visible' });

    // Now use the authenticated page
    await use();
  },
});

export { expect };
