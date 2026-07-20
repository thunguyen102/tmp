import { Page, Locator } from '@playwright/test';
import { BasePage } from '@/pages/base/base.page';
import { EnvConfig } from '@/utils/env.config';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  async goto(): Promise<void> {
    await this.navigate(EnvConfig.APP_BASE_URL);
    await this.waitForElement(this.usernameInput, { timeout: 15000 });
  }

  async enterUsername(username: string): Promise<void> {
    await this.fill(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  async clickSubmit(): Promise<void> {
    await this.click(this.submitButton);
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSubmit();
  }

  async isErrorDisplayed(): Promise<boolean> {
    return await this.isVisible(this.errorMessage, { timeout: 5000 });
  }

  async getErrorText(): Promise<string> {
    if (await this.isErrorDisplayed()) {
      return await this.getText(this.errorMessage);
    }
    return '';
  }
}
