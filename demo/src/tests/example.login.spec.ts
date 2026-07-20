import { test, expect } from '@playwright/test';
import { LoginPage } from '@/pages/login.page';
import { DataGenerator } from '@/utils/data-generator';
import { EnvConfig } from '@/utils/env.config';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Example TC01: Login page should load successfully', async ({ page }) => {
    expect(page.url()).toContain(EnvConfig.APP_BASE_URL);
    expect(await loginPage.isVisible(loginPage.usernameInput)).toBeTruthy();
    expect(await loginPage.isVisible(loginPage.passwordInput)).toBeTruthy();
  });

  test('Example TC02: Should accept username and password input', async () => {
    const testEmail = DataGenerator.generateTestEmail('login');
    const testPassword = DataGenerator.generateTestPassword();

    await loginPage.enterUsername(testEmail);
    await loginPage.enterPassword(testPassword);

    const username = await loginPage.usernameInput.inputValue();
    const password = await loginPage.passwordInput.inputValue();

    expect(username).toBe(testEmail);
    expect(password).toBe(testPassword);
  });

  test('Example TC03: Submit button should be clickable', async () => {
    expect(await loginPage.isEnabled(loginPage.submitButton)).toBeTruthy();
  });
});
