import { Page, Locator } from '@playwright/test';
import { TIMEOUT } from '@/constants/timeout';

export async function clickAndWait(
  page: Page,
  locator: Locator,
  urlPattern?: RegExp | string,
  timeout: number = TIMEOUT.DEFAULT_WAIT
): Promise<void> {
  if (urlPattern) {
    await Promise.all([
      page.waitForNavigation({ timeout: TIMEOUT.PAGE_LOAD }),
      locator.click(),
    ]);
  } else {
    await locator.click();
    await page.waitForTimeout(500);
  }
}

export async function fillInput(
  locator: Locator,
  value: string,
  clearFirst: boolean = true,
  timeout: number = TIMEOUT.DEFAULT_WAIT
): Promise<void> {
  await locator.waitFor({ timeout, state: 'visible' });
  if (clearFirst) {
    await locator.clear();
  }
  await locator.fill(value);
}

export async function selectDropdownOption(
  page: Page,
  dropdownLocator: Locator,
  optionText: string,
  timeout: number = TIMEOUT.DEFAULT_WAIT
): Promise<void> {
  await dropdownLocator.click();
  await page.waitForTimeout(300);
  const option = page.locator(`text=${optionText}`).first();
  await option.click();
}

export async function uploadFile(
  locator: Locator,
  filePath: string,
  timeout: number = TIMEOUT.DEFAULT_WAIT
): Promise<void> {
  const input = locator.locator('input[type="file"]');
  await input.setInputFiles(filePath);
}

export async function waitForElementAndGetText(
  locator: Locator,
  timeout: number = TIMEOUT.DEFAULT_WAIT
): Promise<string> {
  await locator.waitFor({ timeout, state: 'visible' });
  return await locator.textContent() ?? '';
}

export async function isElementVisible(
  locator: Locator,
  timeout: number = 3000
): Promise<boolean> {
  try {
    await locator.waitFor({ timeout, state: 'visible' });
    return true;
  } catch {
    return false;
  }
}
