import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '@/utils/logger';

export class BasePage {
  protected page: Page;
  protected logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger(this.constructor.name);
  }

  async navigate(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded'; timeout?: number }): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    await this.page.goto(url, {
      waitUntil: options?.waitUntil || 'domcontentloaded',
      timeout: options?.timeout || 45000,
    });
  }

  async click(locator: Locator, options?: { timeout?: number; force?: boolean }): Promise<void> {
    this.logger.info(`Clicking element`);
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    await locator.click({ force: options?.force || false });
  }

  async fill(locator: Locator, value: string, options?: { timeout?: number }): Promise<void> {
    this.logger.info(`Filling element with value: ${value}`);
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async type(locator: Locator, text: string, options?: { delay?: number; timeout?: number }): Promise<void> {
    this.logger.info(`Typing text: ${text}`);
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    await locator.type(text, { delay: options?.delay || 50 });
  }

  async getText(locator: Locator, options?: { timeout?: number }): Promise<string> {
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    const text = await locator.textContent();
    this.logger.info(`Retrieved text: ${text}`);
    return text || '';
  }

  async getAttribute(locator: Locator, attribute: string, options?: { timeout?: number }): Promise<string | null> {
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    const value = await locator.getAttribute(attribute);
    this.logger.info(`Retrieved attribute ${attribute}: ${value}`);
    return value;
  }

  async isVisible(locator: Locator, options?: { timeout?: number }): Promise<boolean> {
    try {
      await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
      this.logger.info(`Element is visible`);
      return true;
    } catch {
      this.logger.info(`Element is not visible`);
      return false;
    }
  }

  async isEnabled(locator: Locator, options?: { timeout?: number }): Promise<boolean> {
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    const isEnabled = await locator.isEnabled();
    this.logger.info(`Element is enabled: ${isEnabled}`);
    return isEnabled;
  }

  async waitForElement(locator: Locator, options?: { timeout?: number; state?: 'attached' | 'visible' | 'hidden' | 'disabled' }): Promise<void> {
    const state = options?.state || 'visible';
    this.logger.info(`Waiting for element (${state})`);
    await locator.waitFor({ timeout: options?.timeout || 10000, state });
  }

  async selectOption(locator: Locator, value: string, options?: { timeout?: number }): Promise<void> {
    this.logger.info(`Selecting option: ${value}`);
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    await locator.selectOption(value);
  }

  async check(locator: Locator, options?: { timeout?: number }): Promise<void> {
    this.logger.info(`Checking checkbox`);
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    if (!(await locator.isChecked())) {
      await locator.check();
    }
  }

  async uncheck(locator: Locator, options?: { timeout?: number }): Promise<void> {
    this.logger.info(`Unchecking checkbox`);
    await locator.waitFor({ timeout: options?.timeout || 10000, state: 'visible' });
    if (await locator.isChecked()) {
      await locator.uncheck();
    }
  }

  async takeScreenshot(name?: string): Promise<void> {
    const filename = name || `screenshot-${Date.now()}.png`;
    this.logger.info(`Taking screenshot: ${filename}`);
    await this.page.screenshot({ path: `test-results/${filename}` });
  }

  async waitForNavigation(action: () => Promise<void>, options?: { timeout?: number }): Promise<void> {
    this.logger.info(`Waiting for navigation...`);
    await Promise.all([this.page.waitForNavigation({ timeout: options?.timeout || 30000 }), action()]);
  }

  getCurrentUrl(): string {
    const url = this.page.url();
    this.logger.info(`Current URL: ${url}`);
    return url;
  }

  async waitForUrl(urlPattern: RegExp | string, options?: { timeout?: number }): Promise<void> {
    this.logger.info(`Waiting for URL match: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout: options?.timeout || 30000 });
  }
}
