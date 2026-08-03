import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const featureDir = path.resolve('qa-automation', 'vacancies');
const evidenceDir = path.join(featureDir, 'logs', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });

const save = (name, content) => fs.writeFileSync(path.join(evidenceDir, name), content, 'utf8');

try {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}),
    page.getByRole('button', { name: /login/i }).click(),
  ]);
  await page.getByText('Recruitment', { exact: true }).click();
  await page.getByText('Vacancies', { exact: true }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});

  const activeCheckbox = page.locator('input[type="checkbox"]').first();
  const rssCheckbox = page.locator('input[type="checkbox"]').nth(1);
  const checkState = {
    activeChecked: await activeCheckbox.isChecked().catch(() => null),
    rssChecked: await rssCheckbox.isChecked().catch(() => null),
  };
  save('checkbox-state.json', JSON.stringify(checkState, null, 2));

  const jobTitleMenu = page.locator('.oxd-select-text');
  await jobTitleMenu.click();
  await page.waitForTimeout(1000);
  const options = await page.locator('[role="option"], .oxd-select-option, .oxd-select-dropdown .oxd-select-option').evaluateAll((els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean),
  );
  save('job-title-options.json', JSON.stringify(options, null, 2));
  await page.keyboard.press('Escape').catch(() => {});

  const hiringInput = page.locator('input[placeholder="Type for hints..."]');
  await hiringInput.fill('a');
  await page.waitForTimeout(1000);
  const hiringOptions = await page.locator('[role="option"], .oxd-autocomplete-dropdown .oxd-autocomplete-option, .oxd-autocomplete-option').evaluateAll((els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean),
  );
  save('hiring-manager-options.json', JSON.stringify(hiringOptions, null, 2));
  await page.keyboard.press('Escape').catch(() => {});

  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(evidenceDir, 'blank-save-errors.png'), fullPage: true });
  save('blank-save-body.txt', await page.locator('body').innerText());
  const errorTexts = await page.locator('.oxd-input-field-error-message, .oxd-text.oxd-text--span.oxd-input-field-error-message').evaluateAll((els) =>
    els.map((e) => (e.textContent || '').trim()).filter(Boolean),
  );
  save('validation-errors.json', JSON.stringify(errorTexts, null, 2));
} catch (error) {
  save('validation-error.txt', String(error?.stack || error));
} finally {
  await browser.close();
}
